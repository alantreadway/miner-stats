import * as schema from 'util/schema';
import { SecondsSinceEpoch } from 'util/time-series';

export type DataUpdate =
  MiningPoolAlgorithmProfitability | MiningPoolCoinProfitability | MiningPoolBalance;

export interface MiningPoolAlgorithmProfitability {
  type: 'mining-pool-algo-profitability';
  timestamp: SecondsSinceEpoch;

  pool: schema.AlgoFocusedPool;
  algorithm: schema.Algorithm;
  currencyAmount: schema.DigitalCurrencyAmount;
}

export interface MiningPoolCoinProfitability {
  type: 'mining-pool-coin-profitability';
  timestamp: SecondsSinceEpoch;

  pool: schema.CoinFocusedPool;
  coin: schema.DigitalCurrency;
  algorithm: schema.Algorithm;
  currencyAmount: schema.DigitalCurrencyAmount;
}

export interface MiningPoolBalance {
  type: 'mining-pool-balance';
  timestamp: SecondsSinceEpoch;

  pool: schema.Pool;
  balance: schema.DigitalCurrencyAmount;
}
