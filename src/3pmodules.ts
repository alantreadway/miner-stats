declare module 'bunyan-sentry-stream' {
  import * as raven from 'raven';

  namespace bunyanSentryStream {
    class SentryStream {
      public constructor(ravenClient: raven.Client);
    }
  }

  export = bunyanSentryStream;
}

declare module 'serverless-http' {
  import * as lambda from 'aws-lambda';
  import * as express from 'express';

  function serverless(
    app: express.Application,
  ): (e: lambda.APIGatewayEvent, c: lambda.Context, cb: lambda.Callback) => void;

  export = serverless;
}
