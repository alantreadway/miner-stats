import { Callback, Context } from 'aws-lambda';

import { CONFIG } from 'config';
import { ALGORITHM_METADATA, HashRate, isAlgorithm } from 'model/algorithm';
import { MiningPoolAlgorithmProfitability } from 'model/data-update';
import { LOGGER } from 'util/bunyan';
import { getCurrentTimeInSeconds } from 'util/date';
import { get } from 'util/request-promise';
import { send } from 'util/sns';

const MININGPOOLHUB_STATS_URL =
  'https://miningpoolhub.com/index.php?page=api&action=getautoswitchingandprofitsstatistics';

interface MPHStatsResult {
  algo: string;
  current_mining_coin: string;
  host: string;
  all_host_list: string;
  port: number;
  algo_switch_port: number;
  multialgo_switch_port: number;
  profit: number;
  normalized_profit_amd: number;
  normalized_profit_nvidia: number;
}

type MPHStatsResponseType = {
  success: boolean;
  return: MPHStatsResult[];
};

export async function handler(event: {}, context: Context, callback: Callback): Promise<void> {
  try {
    LOGGER.info({}, 'Retrieving MPH status metrics.');
    const response =
      await get<MPHStatsResponseType>(MININGPOOLHUB_STATS_URL, { json: true });
    LOGGER.info(
      { count: response.return.length },
      'Metrics retrieved.',
    );

    await Promise.all(
      response.return.map(async (result) => {
        const algo = result.algo.toLowerCase();

        if (!isAlgorithm(algo)) {
          LOGGER.warn({ algo }, 'Unrecognised name/algorithm.');
          return;
        }

        // All prices expected to be in MH/s.
        const hashRateMultiplier =
          HashRate.MH / ALGORITHM_METADATA[algo].hashRateMultiplier.miningpoolhub;

        const sendResult = await send<MiningPoolAlgorithmProfitability>(
          {
            algorithm: algo,
            currencyAmount: {
              amount: result.profit * hashRateMultiplier,
              currency: 'BTC',
            },
            pool: 'miningpoolhub',
            timestamp: getCurrentTimeInSeconds(),
            type: 'mining-pool-algo-profitability',
          },
          CONFIG.dataUpdateSnsArn,
          'MPH Status Update',
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
