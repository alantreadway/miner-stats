import { Callback, Context } from 'aws-lambda';

import { CONFIG } from 'config';
import { ALGORITHM_METADATA, HashRate } from 'model/algorithm';
import { MiningPoolCoinProfitability } from 'model/data-update';
import { LOGGER } from 'util/bunyan';
import { getCurrentTimeInSeconds } from 'util/date';
import { get } from 'util/request-promise';
import * as schema from 'util/schema';
import { send } from 'util/sns';

const NANOPOOL_COINS: {[key in schema.DigitalCurrency]?: schema.Algorithm} = {
  ETC: 'daggerhashimoto',
  ETH: 'daggerhashimoto',
  ETN: 'cryptonight',
  PASC: 'pascal',
  SIA: 'blake2b',
  XMR: 'cryptonight',
  ZEC: 'equihash',
};
function nanopoolUrl(key: keyof typeof NANOPOOL_COINS): string {
  const algo = NANOPOOL_COINS[key]!;
  const coin = key.toLowerCase();
  // All prices expected to be in MH/s.
  const hashRateMultiplier = HashRate.MH / ALGORITHM_METADATA[algo].hashRateMultiplier.nanopool;
  return `https://api.nanopool.org/v1/${coin}/approximated_earnings/${hashRateMultiplier}`;
}

type DataKey = 'minute' | 'hour' | 'day';

interface NanopoolResponse {
  status: boolean;
  data: {
    [key in DataKey]: {
      coins: number;
      dollars: number;
      yuan: number;
      euros: number;
      rubles: number;
      bitcoins: number;
    };
  };
}

export async function handler(event: {}, context: Context, callback: Callback): Promise<void> {
  try {
    LOGGER.info({}, 'Retrieving Nanopool approximated earnings.');
    const responses = await Promise.all(
      (Object.keys(NANOPOOL_COINS) as schema.DigitalCurrency[])
        .map(async (coin) => {
          try {
            return [coin, await get<NanopoolResponse>(nanopoolUrl(coin), { json: true }) ];
          } catch (err) {
            LOGGER.error({err}, 'Failed to retrieve earnings.');
            return null;
          }
        }),
      );

    const validResponses =
      responses.filter((r): r is [ schema.DigitalCurrency, NanopoolResponse ] => r != null);
    LOGGER.info(
      { count: validResponses.length },
      'Metrics retrieved.',
    );

    await Promise.all(
      validResponses.map(async ([coin, response]) => {
        const algorithm = NANOPOOL_COINS[coin]!;

        const sendResult = await send<MiningPoolCoinProfitability>(
          {
            algorithm,
            coin,
            currencyAmount: {
              amount: Number(response.data.day.bitcoins),
              currency: 'BTC',
            },
            pool: 'nanopool',
            timestamp: getCurrentTimeInSeconds(),
            type: 'mining-pool-coin-profitability',
          },
          CONFIG.dataUpdateSnsArn,
          'Nanopool Paying Update',
        );

        LOGGER.info({ algorithm, coin, msgId: sendResult.MessageId }, 'Update sent.');
      }),
    );

    callback(undefined, 'Success');
  } catch (err) {
    LOGGER.error(err, 'Failed to complete processing.');
    callback(err, 'Failed to complete processing.');
  }
}
