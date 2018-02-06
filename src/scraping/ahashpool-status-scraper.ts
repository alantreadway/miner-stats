import { Callback, Context } from 'aws-lambda';

import { CONFIG } from 'config';
import { Algorithm, isAlgorithm } from 'model/algorithm';
import { MiningPoolAlgorithmProfitability } from 'model/data-update';
import { LOGGER } from 'util/bunyan';
import { getCurrentTimeInSeconds } from 'util/date';
import { get } from 'util/request-promise';
import { send } from 'util/sns';

const AHASHPOOL_STATUS_URL = 'https://www.ahashpool.com/api/status/';

interface AhashpoolStatusResult {
  name: Algorithm;
  port: number;
  coins: number;
  fees: number;
  hashrate: number;
  workers: number;
  estimate_current: string;
  estimate_last24h: string;
  actual_last24h: string;
  hashrate_last24h: number;
}

type AhashpoolStatusResponseType = {
  [algo in Algorithm]: AhashpoolStatusResult;
};

interface AhashpoolStatusResponse extends AhashpoolStatusResponseType {
  [key: string]: AhashpoolStatusResult;
}

export async function handler(event: {}, context: Context, callback: Callback): Promise<void> {
  try {
    LOGGER.info({}, 'Retrieving Ahashpool status metrics.');
    const response =
      await get<AhashpoolStatusResponse>(AHASHPOOL_STATUS_URL, { json: true });
    LOGGER.info(
      { count: Object.keys(response).length },
      'Metrics retrieved.',
    );

    await Promise.all(
      Object.keys(response)
        .map(async (algo) => {
          const result = response[algo];
          if (!isAlgorithm(algo)) {
            LOGGER.warn({  }, 'Unrecognised name/algorithm.');
            return;
          }

          const sendResult = await send<MiningPoolAlgorithmProfitability>(
            {
              algorithm: algo,
              currencyAmount: {
                amount: Number(result.estimate_current),
                currency: 'BTC',
              },
              pool: 'AHASHPOOL',
              timestamp: getCurrentTimeInSeconds(),
              type: 'mining-pool-algo-profitability',
            },
            CONFIG.dataUpdateSnsArn,
            'Ahashpool Status Update',
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
