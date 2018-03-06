import { LOGGER } from 'util/bunyan';
import { get } from 'util/request-promise';
import { DigitalCurrency, DigitalCurrencyAmount } from 'util/schema';

interface AHashPoolBalanceResponse {
  total_unpaid: number;
  unsold: number;
  currency: DigitalCurrency;
  balance: number;
  total_paid: number;
  total_earned: number;
}

export async function getAhashpoolBalance(walletId: string): Promise<DigitalCurrencyAmount> {
  const response = await get<AHashPoolBalanceResponse>(
    `https://www.ahashpool.com/api/wallet/?address=${walletId}`,
    { json: true },
  );

  return {
    amount: response.total_unpaid + response.unsold,
    currency: response.currency,
  };
}
