import * as aws from 'aws-sdk';
import { CONFIG } from 'config';

export async function decrypt(
  secret: string,
): Promise<string> {
  const kms = new aws.KMS({
    region: CONFIG.kmsConfig.region,
  });

  const result = await kms.decrypt({
    CiphertextBlob: new Buffer(secret, 'base64'),
  })
    .promise();

  return String(result.Plaintext);
}
