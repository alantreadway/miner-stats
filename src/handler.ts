import { Callback, Context, Handler } from 'aws-lambda';
import { CONFIG } from 'config';

export const hello: Handler = (event: {}, context: Context, cb?: Callback) => {
  // tslint:disable-next-line:no-console
  console.log(
    {
      __dirname,
      json: CONFIG.firebase.credentials,
      pwd: process.env.PWD,
    },
    'Here!',
  );

  if (cb) {
    cb(null, 'Success!');
  }
};
