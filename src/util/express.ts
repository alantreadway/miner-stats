import { APIGatewayEvent, Callback, Context } from 'aws-lambda';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as firebase from 'firebase-admin';
// tslint:disable-next-line:no-require-imports
import serverless = require('serverless-http');

import { CONFIG } from 'config';
import { LOGGER } from 'util/bunyan';
import { verifyIdToken } from 'util/firebase';

declare global {
  namespace Express {
    export interface Request {
      authenticatedIdToken: firebase.auth.DecodedIdToken;
      id: string;
    }
  }
}

async function firebaseAuthMiddleware(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction,
): Promise<void> {
  req.id = req.header('X-Request-ID') || String(Math.round(Math.random() * 1000000));

  let firebaseAuthToken = req.header('Authorization');
  if (firebaseAuthToken == null) {
    LOGGER.warn({ reqId: req.id }, 'No Authorization headers, sending 401');
    resp.sendStatus(401);
    return;
  }
  firebaseAuthToken = firebaseAuthToken.split(' ')[1];

  try {
    req.authenticatedIdToken = await verifyIdToken(firebaseAuthToken);
    LOGGER.debug(
      { reqId: req.id, firebaseUid: req.authenticatedIdToken.uid },
      'User authenticated.',
    );

    next();
  } catch (error) {
    LOGGER.warn({ reqId: req.id, firebaseAuthToken }, 'Token invalid');
    resp.sendStatus(401);
    return;
  }
}

function corsMiddleware(
  req: express.Request,
  resp: express.Response,
  next: express.NextFunction,
): void {
    const originConfig = CONFIG.corsOrigin;

    // Mirror the Origin in the incoming request as the allowed Origin. * cannot be used if we
    // want to use cookies.
    resp.header('Access-Control-Allow-Origin', originConfig);
    // Allow cookies.
    resp.header('Access-Control-Allow-Credentials', 'true');
    // Indicate access rules may change based upon differing Origin headers.
    resp.header('Vary', 'Origin');

    resp.header(
      'Access-Control-Allow-Headers',
      [
        'Origin',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
      ].join(', '),
    );

    next();
}

/**
 * Sets up an Express application and wraps it in a `serverless-http` adaptor for use with AWS
 * Lambda and API Gateway.
 *
 * @param callback to allow configuration of Express endpoints
 * @returns a lambda function which will execute incoming APIGatewayEvents using the Express
 *          configuration
 */
export function setupExpressLambda(
  callback: (app: express.Express) => void,
  opts?: {
    bodyParserIgnorePaths?: string[],
    firebaseAuthIgnorePaths?: string[],
  },
): (event: APIGatewayEvent, context: Context, callback: Callback) => void {
  return serverless(setupExpress(callback, opts));
}

function conditionalMiddleware(
  name: string,
  requestHandler: express.RequestHandler,
  ignoredPaths?: string[],
): express.RequestHandler {
  if (ignoredPaths != null) {
    LOGGER.trace({ middleware: name, ignoredPaths }, 'Ignoring middleware for paths.');

    return (req, resp, next) => {
      if (ignoredPaths.indexOf(req.path) >= 0) {
        LOGGER.trace({ middleware: name, path: req.path }, 'Skipping middleware for ignored path.');
        next();
        return;
      }

      requestHandler(req, resp, next);
      return;
    };
  }

  return requestHandler;
}

export function setupExpress(
  callback: (app: express.Express) => void,
  opts?: {
    bodyParserIgnorePaths?: string[],
    firebaseAuthIgnorePaths?: string[],
  },
): express.Express {
  const app = express();

  app.use(conditionalMiddleware(
    'bodyParser.json()',
    bodyParser.json(),
    opts && opts.bodyParserIgnorePaths,
  ));
  app.use(conditionalMiddleware(
    'bodyParser.urlencoded()',
    bodyParser.urlencoded({ extended: false }),
    opts && opts.bodyParserIgnorePaths,
  ));
  app.use(conditionalMiddleware(
    'firebaseAuthMiddleware',
    firebaseAuthMiddleware,
    opts && opts.firebaseAuthIgnorePaths,
  ));
  app.use(corsMiddleware);

  callback(app);

  return app;
}
