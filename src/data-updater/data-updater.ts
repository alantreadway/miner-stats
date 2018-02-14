import { Callback, Context, SNSEvent } from 'aws-lambda';

import {
  DataUpdate,
  MiningPoolAlgorithmProfitability,
  MiningPoolCoinProfitability,
} from 'model/data-update';
import { LOGGER } from 'util/bunyan';
import { get, set, setWithPriority } from 'util/firebase';
import * as schema from 'util/schema';
import { floorTimeToGranularity, TimeGranularity } from 'util/time-series';

export async function handler(
  event: SNSEvent,
  context: Context,
  callback: Callback,
): Promise<void> {
  try {
    await Promise.all(
      event.Records.map(async (record) => {
        const update: DataUpdate = JSON.parse(record.Sns.Message);
        LOGGER.info({ update }, 'Received update, processing...');

        switch (update.type) {
          case 'mining-pool-algo-profitability':
          case 'mining-pool-coin-profitability':
            await processPoolProfitability(update, context);
            break;

          case 'mining-pool-balance':
          default:
            LOGGER.warn({ type: update.type }, 'Not implemented yet.');
            break;
        }
      }),
    );

    callback(undefined, 'Success!');
  } catch (err) {
    LOGGER.error({ err, event }, 'Failed to process SNS event.');
    callback(err, 'Failed to process SNS event.');
  }
}

async function processPoolProfitability(
  up: MiningPoolAlgorithmProfitability | MiningPoolCoinProfitability,
  context: Context,
): Promise<void> {
  const algo = up.algorithm;
  const flooredTimestamp = floorTimeToGranularity(up.timestamp, TimeGranularity.MINUTE) as
    keyof schema.PoolProfitability['per-minute'];

  await set<schema.PoolCurrent>(
    schema.validPath(['v2', 'pool', 'latest', up.pool]),
    {
      algo: up.algorithm,
      amount: up.currencyAmount,
      coin: up.type === 'mining-pool-algo-profitability' ? undefined : up.coin,
      pool: up.pool,
      timestamp: up.timestamp,
    },
  );

  let minutePath: schema.ValidPath<schema.PoolAlgoRecord>;
  if (up.type === 'mining-pool-algo-profitability') {
    minutePath = schema.validPath([
      'v2', 'pool', 'algo', up.pool, algo, 'profitability', 'per-minute', flooredTimestamp,
    ]);
  } else {
    minutePath = schema.validPath([
      'v2', 'pool', 'coin', up.pool, up.coin, algo, 'profitability', 'per-minute', flooredTimestamp,
    ]);
  }

  const record: schema.PoolAlgoRecord = {
    amount: up.currencyAmount,
    timestamp: flooredTimestamp,
  };
  if (up.type === 'mining-pool-algo-profitability') {
    await setWithPriority(minutePath, record, flooredTimestamp, context);
  } else {
    await setWithPriority(minutePath, record, flooredTimestamp, context);
  }

  for (const period of [TimeGranularity.HOUR, TimeGranularity.DAY]) {
    const periodName = `per-${TimeGranularity[period].toLowerCase()}` as 'per-hour' | 'per-day';
    const periodTimestamp = floorTimeToGranularity(up.timestamp, period) as
      keyof schema.PoolProfitability[typeof periodName];

    let periodPath: schema.ValidPath<schema.PoolAlgoRollupRecord>;
    if (up.type === 'mining-pool-algo-profitability') {
      periodPath = schema.validPath([
        'v2', 'pool', 'algo', up.pool, algo, 'profitability', periodName, periodTimestamp,
      ]);
    } else {
      periodPath = schema.validPath([
        'v2', 'pool', 'coin', up.pool, up.coin, algo, 'profitability', periodName, periodTimestamp,
      ]);
    }

    let periodRecord = await get(periodPath, context);
    if (periodRecord == null) {
      periodRecord = {
        count: 1,
        max: up.currencyAmount,
        min: up.currencyAmount,
        sum: up.currencyAmount,
        timestamp: periodTimestamp,
      };
    } else if (periodRecord.sum.currency !== up.currencyAmount.currency) {
      throw new Error('Mismatching update currency vs. existing record.');
    } else {
      periodRecord = {
        ...periodRecord,
        count: periodRecord.count + 1,
        max: {
          amount: Math.max(periodRecord.max.amount, up.currencyAmount.amount),
          currency: periodRecord.max.currency,
        },
        min: {
          amount: Math.min(periodRecord.min.amount, up.currencyAmount.amount),
          currency: periodRecord.min.currency,
        },
        sum: {
          amount: periodRecord.sum.amount + up.currencyAmount.amount,
          currency: periodRecord.sum.currency,
        },
      };
    }

    await setWithPriority(periodPath, periodRecord, periodTimestamp, context);
  }
}
