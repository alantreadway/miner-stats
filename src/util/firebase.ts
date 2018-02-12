import { Context } from 'aws-lambda';
import * as firebase from 'firebase-admin';

import { CONFIG } from 'config';
import { decrypt } from 'util/kms';
import { Schema } from 'util/schema';

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

export async function get<
  A extends keyof Schema,
  R extends Schema[A]
>(
  key: [A],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  R extends Schema[A][B]
>(
  key: [A, B],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  R extends Schema[A][B][C]
>(
  key: [A, B, C],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  R extends Schema[A][B][C][D]
>(
  key: [A, B, C, D],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  R extends Schema[A][B][C][D][E]
>(
  key: [A, B, C, D, E],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  R extends Schema[A][B][C][D][E][F]
>(
  key: [A, B, C, D, E, F],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  R extends Schema[A][B][C][D][E][F][G]
>(
  key: [A, B, C, D, E, F, G],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  R extends Schema[A][B][C][D][E][F][G][H]
>(
  key: [A, B, C, D, E, F, G, H],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  R extends Schema[A][B][C][D][E][F][G][H][I]
>(
  key: [A, B, C, D, E, F, G, H, I],
  context?: Context,
): Promise<R | null>;
export async function get<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  J extends keyof Schema[A][B][C][D][E][F][G][H][I],
  R extends Schema[A][B][C][D][E][F][G][H][I][J]
>(
  key: [A, B, C, D, E, F, G, H, I, J],
  context?: Context,
): Promise<R | null>;
export async function get<T>(
  key: string[],
  context?: Context,
): Promise<T | null> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.join('/'));
  return (await ref.once('value')).val();
}

export async function set<
  A extends keyof Schema,
  T extends Schema[A]
  >(
    key: [A],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  T extends Schema[A][B]
  >(
    key: [A, B],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  T extends Schema[A][B][C]
  >(
    key: [A, B, C],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  T extends Schema[A][B][C][D]
  >(
    key: [A, B, C, D],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  T extends Schema[A][B][C][D][E]
  >(
    key: [A, B, C, D, E],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  T extends Schema[A][B][C][D][E][F]
  >(
    key: [A, B, C, D, E, F],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  T extends Schema[A][B][C][D][E][F][G]
  >(
    key: [A, B, C, D, E, F, G],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  T extends Schema[A][B][C][D][E][F][G][H]
  >(
    key: [A, B, C, D, E, F, G, H],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  T extends Schema[A][B][C][D][E][F][G][H][I]
  >(
    key: [A, B, C, D, E, F, G, H, I],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  J extends keyof Schema[A][B][C][D][E][F][G][H][I],
  T extends Schema[A][B][C][D][E][F][G][H][I][J]
  >(
    key: [A, B, C, D, E, F, G, H, I, J],
    value: T,
    context?: Context,
): Promise<void>;
export async function set<T>(
  key: string[],
  value: T,
  context?: Context,
): Promise<void> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.join('/'));
  return ref.set(value);
}

export async function remove<
  A extends keyof Schema,
  >(
    key: [A],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  >(
    key: [A, B],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  >(
    key: [A, B, C],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  >(
    key: [A, B, C, D],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  >(
    key: [A, B, C, D, E],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  >(
    key: [A, B, C, D, E, F],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  >(
    key: [A, B, C, D, E, F, G],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  >(
    key: [A, B, C, D, E, F, G, H],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  >(
    key: [A, B, C, D, E, F, G, H, I],
    context?: Context,
): Promise<void>;
export async function remove<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  J extends keyof Schema[A][B][C][D][E][F][G][H][I],
  >(
    key: [A, B, C, D, E, F, G, H, I, J],
    context?: Context,
): Promise<void>;
export async function remove(
  key: string[],
  context?: Context,
): Promise<void> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.join('/'));
  return ref.remove();
}

export async function setWithPriority<
  A extends keyof Schema,
  T extends Schema[A]
  >(
    key: [A],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  T extends Schema[A][B]
  >(
    key: [A, B],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  T extends Schema[A][B][C]
  >(
    key: [A, B, C],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  T extends Schema[A][B][C][D]
  >(
    key: [A, B, C, D],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  T extends Schema[A][B][C][D][E]
  >(
    key: [A, B, C, D, E],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  T extends Schema[A][B][C][D][E][F]
  >(
    key: [A, B, C, D, E, F],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  T extends Schema[A][B][C][D][E][F][G]
  >(
    key: [A, B, C, D, E, F, G],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  T extends Schema[A][B][C][D][E][F][G][H]
  >(
    key: [A, B, C, D, E, F, G, H],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  T extends Schema[A][B][C][D][E][F][G][H][I]
  >(
    key: [A, B, C, D, E, F, G, H, I],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<
  A extends keyof Schema,
  B extends keyof Schema[A],
  C extends keyof Schema[A][B],
  D extends keyof Schema[A][B][C],
  E extends keyof Schema[A][B][C][D],
  F extends keyof Schema[A][B][C][D][E],
  G extends keyof Schema[A][B][C][D][E][F],
  H extends keyof Schema[A][B][C][D][E][F][G],
  I extends keyof Schema[A][B][C][D][E][F][G][H],
  J extends keyof Schema[A][B][C][D][E][F][G][H][I],
  T extends Schema[A][B][C][D][E][F][G][H][I][J]
  >(
    key: [A, B, C, D, E, F, G, H, I, J],
    value: T,
    priority: number,
    context?: Context,
): Promise<void>;
export async function setWithPriority<T>(
  key: string[],
  value: T,
  priority: number,
  context?: Context,
): Promise<void> {
  const baseRef = await getBaseRef(context);
  const ref = await baseRef.child(key.join('/'));
  return ref.setWithPriority(value, priority);
}

export async function verifyIdToken(
  token: string,
): Promise<firebase.auth.DecodedIdToken> {
  return await (await getFirebaseApp()).auth().verifyIdToken(token);
}
