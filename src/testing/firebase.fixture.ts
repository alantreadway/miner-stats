import * as faker from 'faker';
import * as firebase from 'firebase-admin';

export interface MockFirebaseUser {
  decodedToken: firebase.auth.DecodedIdToken;
  uid: string;
  verificationToken: string;
  displayName: string;
}

export function firebaseUid(): string {
  return faker.internet.password(28, false);
}

export function firebaseDecodedIdToken({
  uid = firebaseUid(),
  email = faker.internet.email(),
  email_verified = faker.random.boolean(),
  picture = <string | undefined> faker.random.image(),
} = {}): firebase.auth.DecodedIdToken {
  return {
    aud: faker.random.alphaNumeric(),
    auth_time: faker.random.number(),
    email,
    email_verified,
    exp: faker.random.number(),
    firebase: {
      identities: {
        email: [email],
      },
      sign_in_provider: 'password',
    },
    iat: faker.random.number(),
    iss: faker.random.alphaNumeric(),
    name: faker.name.findName(),
    picture,
    sub: faker.random.alphaNumeric(),
    uid,
    user_id: uid,
  };
}

export function mockFirebaseUser({
  uid = faker.random.alphaNumeric(20),
} = {}): MockFirebaseUser {
  return {
    decodedToken: firebaseDecodedIdToken({ uid }),
    displayName: faker.name.findName(),
    uid,
    verificationToken: faker.random.alphaNumeric(100),
  };
}
