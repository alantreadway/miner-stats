import { Context } from 'aws-lambda';
import * as firebase from 'firebase-admin';

import { CONFIG } from 'config';
import { decrypt } from 'util/kms';

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

type MaybePromise<T> = Promise<T> | T;

export async function get<T>(
  key: string,
  context?: Context,
  ref: MaybePromise<firebase.database.Reference> = getBaseRef(context),
): Promise<T | null> {
  return (await (await ref).child(key).once('value')).val();
}

export async function reference(
  key: string,
  context?: Context,
  ref: MaybePromise<firebase.database.Reference> = getBaseRef(context),
): Promise<firebase.database.Reference> {
  return (await ref).child(key);
}

export async function set<T>(
  key: string,
  value: T,
  context?: Context,
  ref: MaybePromise<firebase.database.Reference> = getBaseRef(context),
): Promise<void> {
  return (await ref).child(key).set(value);
}

export async function remove(
  key: string,
  context?: Context,
  ref: MaybePromise<firebase.database.Reference> = getBaseRef(context),
): Promise<void> {
  return (await ref).child(key).remove();
}

export async function setWithPriority<T>(
  key: string,
  value: T,
  priority: number,
  context?: Context,
  ref: MaybePromise<firebase.database.Reference> = getBaseRef(context),
): Promise<void> {
  await (await ref).child(key)
    .setWithPriority(value, priority);
}

export async function verifyIdToken(
  token: string,
): Promise<firebase.auth.DecodedIdToken> {
  return await (await getFirebaseApp()).auth().verifyIdToken(token);
}
