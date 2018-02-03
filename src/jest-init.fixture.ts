let mockGetCurrentTimeInMilliseconds = jest.fn();
const mockRequestPromiseResponses: Map<string, Promise<{}>> = new Map();
const mockFirebaseGetResponses: Map<string, {}> = new Map();
const mockFirebaseVerifyIdTokenResponses: Map<string, {}> = new Map();

// By default mock/stub Firebase and Logging calls.
jest.mock(
  './util/firebase',
  () => {
    return {
      get: jest.fn(
        (key, context, ref) => {
          const fullKey = [ref && ref.key, key]
            .filter(v => v != null)
            .join('/');
          return Promise.resolve(
            mockFirebaseGetResponses.get(fullKey) || null,
          );
        },
      ),
      // Add reference function that returns a mock reference containing the key it refers to.
      reference: jest.fn(
        (key, context) => {
          return Promise.resolve({ key });
        },
      ),
      remove: jest.fn(),
      set: jest.fn(),
      setWithPriority: jest.fn(),
      verifyIdToken: jest.fn(
        (token) => {
          if (mockFirebaseVerifyIdTokenResponses.has(token)) {
            return mockFirebaseVerifyIdTokenResponses.get(token);
          }

          throw new Error('Invalid token: ' + token);
        },
      ),
    };
  },
);
jest.mock('./util/bunyan');
jest.mock(
  './util/sns',
  () => {
    return {
      send: jest.fn(
        () => Promise.resolve({ MessageId: new Date().getTime() }),
      ),
    };
  },
);
jest.mock(
  './util/request-promise',
  () => {
    return {
      get: jest.fn(
        (uri) => mockRequestPromiseResponses.get(uri) ||
          Promise.reject(new Error('Unmocked request for: ' + uri)),
      ),
    };
  },
);

// Enable pseudo-stbbing of current time.
jest.mock(
  './util/date',
  () => {
    return {
      getCurrentTimeInMilliseconds: mockGetCurrentTimeInMilliseconds,
    };
  },
);

import * as firebase from 'firebase-admin';

const REFERENCE_TIME = new Date('2018-01-19T12:04:00.000Z');
export const REFERENCE_TIME_SECONDS_SINCE_EPOCH = REFERENCE_TIME.getTime() / 1000;

export function resetCurrentTime(): void {
  mockGetCurrentTimeInMilliseconds.mockReturnValue(REFERENCE_TIME.getTime());
}
export function setCurrentTime(timeInSecondsSinceEpoch: number): void {
  mockGetCurrentTimeInMilliseconds.mockReturnValue(timeInSecondsSinceEpoch * 1000);
}
resetCurrentTime();

export function mockRequestPromiseGet<T>(
  uri: string,
  result: Promise<T>,
): void {
  mockRequestPromiseResponses.set(uri, result);
}

export function mockFirebaseGet<T>(
  key: string,
  value: T,
): void {
  mockFirebaseGetResponses.set(key, value);
}

export function mockFirebaseVerifyIdToken(
  token: string,
  decodedToken: firebase.auth.DecodedIdToken,
): void {
  mockFirebaseVerifyIdTokenResponses.set(token, decodedToken);
}

export function resetMocks(): void {
  mockRequestPromiseResponses.clear();
  mockFirebaseGetResponses.clear();
  mockFirebaseVerifyIdTokenResponses.clear();
  resetCurrentTime();
}

// Ensure we always use the 'test' configuration.
process.env.ENV = 'test';
