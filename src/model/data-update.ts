import { Algorithm } from 'model/algorithm';
import { MiningPool } from 'model/mining-pool';
import * as schema from 'util/schema';
import { SecondsSinceEpoch } from 'util/time-series';

export type DataUpdate = MiningPoolAlgorithmProfitability | MiningPoolBalance;

export interface MiningPoolAlgorithmProfitability {
  type: 'mining-pool-algo-profitability';
  timestamp: SecondsSinceEpoch;

  pool: MiningPool;
  algorithm: Algorithm;
  currencyAmount: schema.DigitalCurrencyAmount;
}

export interface MiningPoolBalance {
  type: 'mining-pool-balance';
  timestamp: SecondsSinceEpoch;

  pool: MiningPool;
  balance: schema.DigitalCurrencyAmount;
}
