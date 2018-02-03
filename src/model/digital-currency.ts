export type DigitalCurrency =
  'ADX' |
  'BCH' |
  'BTC' |
  'BQX' |
  'CJ' |
  'ETH' |
  'GNO' |
  'KMD' |
  'ICX' |
  'LTC' |
  'NEO' |
  'STEEM' |
  'TNT' |
  'XRP' |
  'ZEC';

export const ALL_DIGITAL_CURRENCIES: DigitalCurrency[] = [
  'ADX',
  'BCH',
  'BTC',
  'BQX',
  'CJ',
  'ETH',
  'LTC',
  'GNO',
  'KMD',
  'ICX',
  'NEO',
  'STEEM',
  'TNT',
  'XRP',
  'ZEC',
];

export function isDigitalCurrency(currency: string): currency is DigitalCurrency {
  return ALL_DIGITAL_CURRENCIES.find((dc) => dc === currency) != null;
}

export interface DigitalCurrencyAmount {
  currency: DigitalCurrency;
  amount: number;
}
