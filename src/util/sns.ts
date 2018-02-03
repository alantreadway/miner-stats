import * as aws from 'aws-sdk';

import { CONFIG } from 'config';

export async function send<T>(
  message: T,
  topic: string,
  subject: string,
): Promise<aws.SNS.PublishResponse> {
  const sns = new aws.SNS({
    ...CONFIG.snsConfig,
  });

  return sns.publish({
    Message: JSON.stringify(message, null, 2),
    Subject: subject,
    TopicArn: topic,
  })
    .promise();
}
