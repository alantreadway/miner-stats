import { Algorithm } from 'model/algorithm';
import { DigitalCurrencyAmount } from 'model/digital-currency';
import { SecondsSinceEpoch } from 'util/time-series';

export type DataUpdate = MiningPoolAlgorithmProfitability | MiningPoolBalance;

export interface MiningPoolAlgorithmProfitability {
  type: 'mining-pool-algo-profitability';
  timestamp: SecondsSinceEpoch;

  algorithm: Algorithm;
  currencyAmount: DigitalCurrencyAmount;
}

export interface MiningPoolBalance {
  type: 'mining-pool-balance';
  timestamp: SecondsSinceEpoch;

  balance: DigitalCurrencyAmount;
}
