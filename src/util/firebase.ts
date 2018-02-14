import { Context } from 'aws-lambda';
import * as firebase from 'firebase-admin';

import { CONFIG } from 'config';
import { decrypt } from 'util/kms';
import { ValidPath } from 'util/schema';

let initAppPromise: Promise<firebase.app.App>;

/**
 * Returns an existing Firebase App instance, or creates a new one if necesssary.
 *
 * @param context lambda execution context
 * @returns an initialised Firebase App
 */
export async function getFirebaseApp(context?: Context): Promise<firebase.app.App> {
  // Lambda setup notes from here:
  //  https://stackoverflow.com/questions/37325775/amazon-lambda-to-firebase

  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  const app = firebase.apps[0];
  if (app == null) {
    // Since loading of client credentials is asynchronous, this is a critical block; initAppPromise
    // acts as a semaphore to ensure that only the first caller triggers initialisation, the rest
    // just wait for the first caller to complete app initialisation.
    if (initAppPromise == null) {
      initAppPromise = (async (): Promise<firebase.app.App> => {
        const certBlob = await decrypt(
          await CONFIG.firebase.credentials(),
        );
        const certJson = JSON.parse(new Buffer(certBlob, 'base64').toString());

        // Takes over 5 seconds to init lambdas on init
        return firebase.initializeApp({
          credential: firebase.credential.cert(certJson),
          databaseURL: CONFIG.firebase.databaseUrl,
        });
      })();
    }

    return await initAppPromise;
  }

  // Only takes 200ms to reuse the 'app' if already run.
  return app;
}

async function getBaseRef(context?: Context): Promise<firebase.database.Reference> {
  return (await getFirebaseApp(context)).database().ref();
}

export async function get<T>(
  key: ValidPath<T>,
  context?: Context,
): Promise<T | null> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.path.join('/'));
  return (await ref.once('value')).val();
}

export async function set<T>(
  key: ValidPath<T>,
  value: T,
  context?: Context,
): Promise<void> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.path.join('/'));
  return ref.set(value);
}

export async function remove<T>(
  key: ValidPath<T>,
  context?: Context,
): Promise<void> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.path.join('/'));
  return ref.remove();
}

export async function setWithPriority<T>(
  key: ValidPath<T>,
  value: T,
  priority: number,
  context?: Context,
): Promise<void> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.path.join('/'));
  return ref.setWithPriority(value, priority);
}

export async function verifyIdToken(
  token: string,
): Promise<firebase.auth.DecodedIdToken> {
  return await (await getFirebaseApp()).auth().verifyIdToken(token);
}
