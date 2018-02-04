import { Callback, Context, Handler } from 'aws-lambda';
import { CONFIG } from 'config';
import * as fs from 'fs';

export const hello: Handler = (event: {}, context: Context, cb?: Callback) => {
  // tslint:disable-next-line:no-console
  console.log(
    {
      __dirname,
      exists: fs.existsSync(CONFIG.firebase.serviceAccountJson),
      json: CONFIG.firebase.serviceAccountJson,
      pwd: process.env.PWD,
    },
    'Here!',
  );

  if (cb) {
    cb(null, 'Success!');
  }
};
