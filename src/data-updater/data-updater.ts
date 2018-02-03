import { Callback, Context, SNSEvent } from 'aws-lambda';

import { DataUpdate } from 'model/data-update';
import { LOGGER } from 'util/bunyan';

export async function handler(
  event: SNSEvent,
  context: Context,
  callback: Callback,
): Promise<void> {
  try {
    for (const record of event.Records) {
      const update: DataUpdate = JSON.parse(record.Sns.Message);
      LOGGER.info({ update }, 'Received.');
    }

    callback(undefined, 'Success!');
  } catch (err) {
    LOGGER.error({ err, event }, 'Failed to process SNS event.');
    callback(err, 'Failed to process SNS event.');
  }
}
