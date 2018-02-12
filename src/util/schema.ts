const ALGORITHMS = {
  axiom: true,
  bastion: true,
  bitcore: true,
  blake: true,
  blake256r14: true,
  blake256r8: true,
  blake256r8vnl: true,
  blake2s: true,
  blakecoin: true,
  bmw: true,
  c11: true,
  cryptonight: true,
  daggerhashimoto: true,
  decred: true,
  deep: true,
  equihash: true,
  ethash: true,
  fresh: true,
  fugue256: true,
  groestl: true,
  hmq1725: true,
  hodl: true,
  hsr: true,
  jackpot: true,
  jha: true,
  keccak: true,
  lbry: true,
  luffa: true,
  lyra2: true,
  lyra2re: true,
  lyra2re2: true,
  lyra2rev2: true,
  lyra2v2: true,
  lyra2z: true,
  m7m: true,
  'myr-gr': true,
  myriad: true,
  neoscrypt: true,
  nist5: true,
  pascal: true,
  penta: true,
  phi: true,
  polytimos: true,
  quark: true,
  qubit: true,
  s3: true,
  scrypt: true,
  scryptjanenf16: true,
  scryptnf: true,
  sha256: true,
  sha256d: true,
  sha256t: true,
  sia: true,
  sib: true,
  skein: true,
  skein2: true,
  skunk: true,
  timetravel: true,
  tribus: true,
  vanilla: true,
  veltor: true,
  whirlpool: true,
  whirlpoolx: true,
  x11: true,
  x11evo: true,
  x11ghost: true,
  x13: true,
  x14: true,
  x15: true,
  x17: true,
  xevan: true,
  yescrypt: true,
  zr5: true,
};

const POOLS = {
  ahashpool: true,
  miningpoolhub: true,
  nicehash: true,
};

export type Algorithm = keyof typeof ALGORITHMS;
export const ALL_ALGORITHMS = Object.keys(ALGORITHMS) as Algorithm[];

export type Pool = keyof typeof POOLS;
export const ALL_POOLS = Object.keys(POOLS) as Pool[];

export type SecondsSinceEpoch = number;

export type DigitalCurrency = 'BTC';

export interface DigitalCurrencyAmount {
  currency: DigitalCurrency;
  amount: number;
}

export interface PoolAlgoRecord {
  amount: DigitalCurrencyAmount;
  timestamp: SecondsSinceEpoch;
}

export interface PoolAlgoRollupRecord {
  min: DigitalCurrencyAmount;
  max: DigitalCurrencyAmount;
  sum: DigitalCurrencyAmount;
  count: number;
  timestamp: SecondsSinceEpoch;
}

export interface PoolProfitability {
  'per-minute': {
    [timestamp: number]: PoolAlgoRecord;
  };
  'per-hour': {
    [timestamp: number]: PoolAlgoRollupRecord;
  };
  'per-day': {
    [timestamp: number]: PoolAlgoRollupRecord;
  };
}
export type PoolStatistics = {
  [algo in Algorithm]: { profitability: PoolProfitability };
};

export interface RigProfile {
  name: string;
  hashrates: {[algo in Algorithm]?: number };
}
export interface UserProfile {
  defaults: {
    'rig-profile': string;
  };
  'rig-profile': {
    [profileUuid: string]: RigProfile;
  };
}

export interface Schema {
  v2: {
    'rig-profile': {
      [profileUuid: string]: RigProfile;
    };
    pool: {
      [key in Pool]: PoolStatistics;
    };
    user: {
      [firebaseUid: string]: UserProfile;
    };
  };
}
