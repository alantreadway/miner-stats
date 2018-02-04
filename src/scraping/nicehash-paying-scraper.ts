import { Callback, Context } from 'aws-lambda';

import { CONFIG } from 'config';
import { Algorithm, isAlgorithm } from 'model/algorithm';
import { MiningPoolAlgorithmProfitability } from 'model/data-update';
import { LOGGER } from 'util/bunyan';
import { getCurrentTimeInSeconds } from 'util/date';
import { get } from 'util/request-promise';
import { send } from 'util/sns';

const NICEHASH_SIMPLEMULTIALGO_URL = 'https://api.nicehash.com/api?method=simplemultialgo.info';

interface NiceHashSimpleMultiAlgoResponse {
  method: 'simplemultialgo.info';
  result: {
    simplemultialgo: {
      paying: string;
      port: number;
      name: Algorithm;
      algo: number;
    }[];
  };
}

export async function handler(event: {}, context: Context, callback: Callback): Promise<void> {
  try {
    LOGGER.info({}, 'Retrieving Nicehash paying metrics.');
    const response =
      await get<NiceHashSimpleMultiAlgoResponse>(NICEHASH_SIMPLEMULTIALGO_URL, { json: true });
    LOGGER.info(
      { count: response.result.simplemultialgo.length },
      'Metrics retrieved.',
    );

    await Promise.all(
      response.result.simplemultialgo
        .map(async (result) => {
          const algo = result.name;
          if (!isAlgorithm(algo)) {
            LOGGER.warn({ result }, 'Unrecognised name/algorithm.');
            return;
          }

          const sendResult = await send<MiningPoolAlgorithmProfitability>(
            {
              algorithm: algo,
              currencyAmount: {
                amount: Number(result.paying),
                currency: 'BTC',
              },
              pool: 'NICEHASH',
              timestamp: getCurrentTimeInSeconds(),
              type: 'mining-pool-algo-profitability',
            },
            CONFIG.dataUpdateSnsArn,
            'NiceHash Paying Update',
          );

          LOGGER.info({ algo, msgId: sendResult.MessageId }, 'Update sent.');
        }),
    );

    callback(undefined, 'Success');
  } catch (err) {
    LOGGER.error(err, 'Failed to complete processing.');
    callback(err, 'Failed to complete processing.');
  }
}
