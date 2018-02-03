import { Algorithm } from 'model/algorithm';
import { DigitalCurrency } from 'model/digital-currency';

export type DataUpdate = MiningPoolAlgorithmProfitability | MiningPoolBalance;

export interface MiningPoolAlgorithmProfitability {
  type: 'mining-pool-algo-profitability';
  algorithm: Algorithm;
}

export interface MiningPoolBalance {
  type: 'mining-pool-balance';
  currency: DigitalCurrency;
  balance: number;
}
