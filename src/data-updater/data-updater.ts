import { Callback, Context, SNSEvent } from 'aws-lambda';

import { DataUpdate, MiningPoolAlgorithmProfitability } from 'model/data-update';
import { DigitalCurrencyAmount } from 'model/digital-currency';
import { LOGGER } from 'util/bunyan';
import { get, setWithPriority } from 'util/firebase';
import { floorTimeToGranularity, SecondsSinceEpoch, TimeGranularity } from 'util/time-series';

interface MiningPoolAlgorithmProfitabilityRecord {
  amount: DigitalCurrencyAmount;
  timestamp: SecondsSinceEpoch;
}

interface MiningPoolAlgorithmProfitabilityRollup {
  min: DigitalCurrencyAmount;
  max: DigitalCurrencyAmount;
  sum: DigitalCurrencyAmount;
  count: number;
  timestamp: SecondsSinceEpoch;
}

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
  update: MiningPoolAlgorithmProfitability,
  context: Context,
): Promise<void> {
  const algo = update.algorithm.toLowerCase();
  const pool = update.pool.toLowerCase();
  const flooredTimestamp = floorTimeToGranularity(update.timestamp, TimeGranularity.MINUTE);

  const record: MiningPoolAlgorithmProfitabilityRecord = {
    amount: update.currencyAmount,
    timestamp: flooredTimestamp,
  };
  await setWithPriority(
    `/v1/pool/${pool}/${algo}/profitability/per-minute/${flooredTimestamp}`,
    record,
    flooredTimestamp,
    context,
  );

  for (const period of [TimeGranularity.HOUR, TimeGranularity.DAY]) {
    const periodTimestamp = floorTimeToGranularity(update.timestamp, period);
    const periodName = TimeGranularity[period].toLowerCase();
    const periodKey = `/v1/pool/${pool}/${algo}/profitability/per-${periodName}/${periodTimestamp}`;

    let periodRecord = await get<MiningPoolAlgorithmProfitabilityRollup>(periodKey);
    if (periodRecord == null) {
      periodRecord = {
        count: 1,
        max: update.currencyAmount,
        min: update.currencyAmount,
        sum: update.currencyAmount,
        timestamp: periodTimestamp,
      };
    } else if (periodRecord.sum.currency !== update.currencyAmount.currency) {
      throw new Error('Mismatching update currency vs. existing record.');
    } else {
      periodRecord = {
        ...periodRecord,
        count: periodRecord.count + 1,
        max: {
          amount: Math.max(periodRecord.max.amount, update.currencyAmount.amount),
          currency: periodRecord.max.currency,
        },
        min: {
          amount: Math.min(periodRecord.min.amount, update.currencyAmount.amount),
          currency: periodRecord.min.currency,
        },
        sum: {
          amount: periodRecord.sum.amount + update.currencyAmount.amount,
          currency: periodRecord.sum.currency,
        },
      };
    }

    await setWithPriority(periodKey, periodRecord, periodTimestamp, context);
  }
}
