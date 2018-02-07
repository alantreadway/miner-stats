export type Algorithm =
  'axiom' |
  'bitcore' |
  'blake256r14' |
  'blake256r8' |
  'blake256r8vnl' |
  'blake2s' |
  'blakecoin' |
  'c11' |
  'cryptonight' |
  'daggerhashimoto' |
  'decred' |
  'equihash' |
  'ethash' |
  'groestl' |
  'hmq1725' |
  'hodl' |
  'hsr' |
  'keccak' |
  'lbry' |
  'lyra2re' |
  'lyra2re2' |
  'lyra2rev2' |
  'lyra2v2' |
  'lyra2z' |
  'm7m' |
  'myr-gr' |
  'myriad' |
  'neoscrypt' |
  'nist5' |
  'pascal' |
  'quark' |
  'qubit' |
  'scrypt' |
  'scryptjanenf16' |
  'scryptnf' |
  'sia' |
  'sib' |
  'sha256' |
  'skein' |
  'skunk' |
  'timetravel' |
  'tribus' |
  'whirlpoolx' |
  'x11' |
  'x11ghost' |
  'x13' |
  'x15' |
  'x17' |
  'xevan' |
  'yescrypt';

const enum HashRate {
  KH = 1e3,
  GH = 1e9,
  MH = 1e6,
  TH = 1e12,
  PH = 1e15,
}

export interface AlgorithmMetadata<T extends Algorithm> {
  algorithm: T;
  hashRateMultiplier: HashRate;
}

function buildAlgorithmMetadata<T extends Algorithm>(algo: T): AlgorithmMetadata<T> {
  let hashRate = HashRate.MH;
  switch (algo) {
    case 'blake2s':
    case 'blakecoin':
      hashRate = HashRate.GH;
      break;

    case 'yesscript':
      hashRate = HashRate.KH;
      break;

    default:
  }

  return {
    algorithm: algo,
    hashRateMultiplier: hashRate,
  };
}

type AlgorithmMetadataDictionary = { [algo in Algorithm]: AlgorithmMetadata<algo> };

export const ALGORITHM_METADATA: AlgorithmMetadataDictionary = {
  axiom: buildAlgorithmMetadata('axiom'),
  bitcore: buildAlgorithmMetadata('bitcore'),
  blake256r14: buildAlgorithmMetadata('blake256r14'),
  blake256r8: buildAlgorithmMetadata('blake256r8'),
  blake256r8vnl: buildAlgorithmMetadata('blake256r8vnl'),
  blake2s: buildAlgorithmMetadata('blake2s'),
  blakecoin: buildAlgorithmMetadata('blakecoin'),
  c11: buildAlgorithmMetadata('c11'),
  cryptonight: buildAlgorithmMetadata('cryptonight'),
  daggerhashimoto: buildAlgorithmMetadata('daggerhashimoto'),
  decred: buildAlgorithmMetadata('decred'),
  equihash: buildAlgorithmMetadata('equihash'),
  ethash: buildAlgorithmMetadata('ethash'),
  groestl: buildAlgorithmMetadata('groestl'),
  hmq1725: buildAlgorithmMetadata('hmq1725'),
  hodl: buildAlgorithmMetadata('hodl'),
  hsr: buildAlgorithmMetadata('hsr'),
  keccak: buildAlgorithmMetadata('keccak'),
  lbry: buildAlgorithmMetadata('lbry'),
  lyra2re: buildAlgorithmMetadata('lyra2re'),
  lyra2re2: buildAlgorithmMetadata('lyra2re2'),
  lyra2rev2: buildAlgorithmMetadata('lyra2rev2'),
  lyra2v2: buildAlgorithmMetadata('lyra2v2'),
  lyra2z: buildAlgorithmMetadata('lyra2z'),
  m7m: buildAlgorithmMetadata('m7m'),
  'myr-gr': buildAlgorithmMetadata('myr-gr'),
  myriad: buildAlgorithmMetadata('myriad'),
  neoscrypt: buildAlgorithmMetadata('neoscrypt'),
  nist5: buildAlgorithmMetadata('nist5'),
  pascal: buildAlgorithmMetadata('pascal'),
  quark: buildAlgorithmMetadata('quark'),
  qubit: buildAlgorithmMetadata('qubit'),
  scrypt: buildAlgorithmMetadata('scrypt'),
  scryptjanenf16: buildAlgorithmMetadata('scryptjanenf16'),
  scryptnf: buildAlgorithmMetadata('scryptnf'),
  sha256: buildAlgorithmMetadata('sha256'),
  sia: buildAlgorithmMetadata('sia'),
  sib: buildAlgorithmMetadata('sib'),
  skein: buildAlgorithmMetadata('skein'),
  skunk: buildAlgorithmMetadata('skunk'),
  timetravel: buildAlgorithmMetadata('timetravel'),
  tribus: buildAlgorithmMetadata('tribus'),
  whirlpoolx: buildAlgorithmMetadata('whirlpoolx'),
  x11: buildAlgorithmMetadata('x11'),
  x11ghost: buildAlgorithmMetadata('x11ghost'),
  x13: buildAlgorithmMetadata('x13'),
  x15: buildAlgorithmMetadata('x15'),
  x17: buildAlgorithmMetadata('x17'),
  xevan: buildAlgorithmMetadata('xevan'),
  yescrypt: buildAlgorithmMetadata('yescrypt'),
};

export const ALGORITHMS = Object.keys(ALGORITHM_METADATA) as Algorithm[];

export function isAlgorithm(val: string): val is Algorithm {
  return ALGORITHMS.find((a) => a === val) != null;
}
