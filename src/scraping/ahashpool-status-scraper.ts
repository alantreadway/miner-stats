import { Callback, Context } from 'aws-lambda';

import { CONFIG } from 'config';
import { Algorithm, ALGORITHM_METADATA, HashRate, isAlgorithm } from 'model/algorithm';
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

    const totalWorkers = Object.keys(response)
      .reduce(
        (total, algo) => {
          return total + response[algo].workers;
        },
        0,
      );

    await Promise.all(
      Object.keys(response)
        .map(async (algo) => {
          const result = response[algo];
          if (!isAlgorithm(algo)) {
            LOGGER.warn({ algo }, 'Unrecognised name/algorithm.');
            return;
          }

          // All prices expected to be in MH/s.
          const hashRateMultiplier =
            HashRate.MH / ALGORITHM_METADATA[algo].hashRateMultiplier.ahashpool;

          const sendResult = await send<MiningPoolAlgorithmProfitability>(
            {
              algorithm: algo,
              currencyAmount: {
                amount: Number(result.estimate_current) * hashRateMultiplier,
                currency: 'BTC',
              },
              pool: 'ahashpool',
              poolWorkerProportion: result.workers / totalWorkers,
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
