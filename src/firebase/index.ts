import * as firebase from 'firebase-admin';
import * as functions from 'firebase-functions';

import { PoolProfitability, SecondsSinceEpoch } from 'util/schema';
import { TimeGranularity } from 'util/time-series';

/* tslint:disable:no-console */

firebase.initializeApp();

export const cleanupOnAlgoPoolTimeseriesAddition = functions.database.ref(
  '/v2/pool/algo/{pool}/{algo}/profitability/{timeRange}/{timestamp}',
)
  .onCreate(async (data, context) => {
    const params = context!.params!;
    const timestamp = Number(params.timestamp);

    let rangeToKeep: number | undefined = undefined;
    switch (params.timeRange as keyof PoolProfitability) {
      case 'per-minute':
        rangeToKeep = TimeGranularity.MINUTE * 300;
        break;
      case 'per-hour':
        rangeToKeep = TimeGranularity.HOUR * 72;
        break;
      default:
      case 'per-day':
        return;
    }

    if (rangeToKeep == null) {
      return;
    }

    await clean(
      `/v2/pool/algo/${params.pool}/${params.algo}/profitability/${params.timeRange}`,
      timestamp,
      rangeToKeep,
    );
  });

export const cleanupOnCoinPoolTimeseriesAddition = functions.database.ref(
  '/v2/pool/coin/{pool}/{coin}/{algo}/profitability/{timeRange}/{timestamp}',
)
  .onCreate(async (data, context) => {
    const params = context!.params!;
    const timestamp = Number(params.timestamp);

    let rangeToKeep: number | undefined = undefined;
    switch (params.timeRange as keyof PoolProfitability) {
      case 'per-minute':
        rangeToKeep = TimeGranularity.MINUTE * 300;
        break;
      case 'per-hour':
        rangeToKeep = TimeGranularity.HOUR * 72;
        break;
      default:
      case 'per-day':
        return;
    }

    if (rangeToKeep == null) {
      return;
    }

    await clean(
      `/v2/pool/coin/${params.pool}/${params.coin}/${params.algo}/profitability/` +
      `${params.timeRange}`,
      timestamp,
      rangeToKeep,
    );
  });

async function clean(
  path: string,
  timestamp: SecondsSinceEpoch,
  periodToKeep: number,
): Promise<void> {
  const removals: Promise<void>[] = [];
  await firebase.database().ref(path)
    .orderByPriority()
    .limitToFirst(1000)
    .endAt(timestamp - periodToKeep)
    .once('value', (snapshot) => {
      snapshot.forEach((child) => {
        console.log({ key: child.key, path: child.ref.path }, 'Cleaning stale data.');
        removals.push(child.ref.remove());
        return false;
      });
    });

  console.log({count: removals.length}, 'Waiting for cleanup to complete.');
  await Promise.all(removals);
}
