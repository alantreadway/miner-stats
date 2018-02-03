import { Context } from 'aws-lambda';
import * as firebase from 'firebase-admin';

import { CONFIG } from 'config';

/**
 * Returns an existing Firebase App instance, or creates a new one if necesssary.
 *
 * @param context lambda execution context
 * @returns an initialised Firebase App
 */
export function getFirebaseApp(context?: Context): firebase.app.App {
  // Lambda setup notes from here:
  //  https://stackoverflow.com/questions/37325775/amazon-lambda-to-firebase

  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  const app = firebase.apps[0];
  if (app == null) {
    // Takes over 5 seconds to init lambdas on init
    return firebase.initializeApp({
      credential: firebase.credential.cert(CONFIG.firebase.serviceAccountJson),
      databaseURL: CONFIG.firebase.databaseUrl,
    });
  }

  // Only takes 200ms to reuse the 'app' if already run.
  return app;
}

export async function get<T>(
  key: string,
  context?: Context,
  ref: firebase.database.Reference = getFirebaseApp(context).database().ref(),
): Promise<T | null> {
  return (await ref.child(key).once('value')).val();
}

export async function reference(
  key: string,
  context?: Context,
  ref: firebase.database.Reference = getFirebaseApp(context).database().ref(),
): Promise<firebase.database.Reference> {
  return ref.child(key);
}

export async function set<T>(
  key: string,
  value: T,
  context?: Context,
  ref: firebase.database.Reference = getFirebaseApp(context).database().ref(),
): Promise<void> {
  return ref.child(key).set(value);
}

export async function remove(
  key: string,
  context?: Context,
  ref: firebase.database.Reference = getFirebaseApp(context).database().ref(),
): Promise<void> {
  return ref.child(key).remove();
}

export async function setWithPriority<T>(
  key: string,
  value: T,
  priority: number,
  context?: Context,
  ref: firebase.database.Reference = getFirebaseApp(context).database().ref(),
): Promise<void> {
  await ref.child(key)
    .setWithPriority(value, priority);
}

export async function verifyIdToken(
  token: string,
): Promise<firebase.auth.DecodedIdToken> {
  return await getFirebaseApp().auth().verifyIdToken(token);
}
