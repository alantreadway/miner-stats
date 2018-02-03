export type Algorithm =
  'sha256' |
  'ethash' |
  'equihash' |
  'blake2s' |
  'blakecoin' |
  'lyra2re2' |
  'lyra2z' |
  'neoscrypt' |
  'groestl' |
  'keccak' |
  'skein' |
  'cryptonight' |
  'myriad' |
  'yescrypt' |
  'qubit' |
  'sia' |
  'scrypt' |
  'x11';

const enum HashRate {
  KH = 1e3,
  GH = 1e9,
  MH = 1e6,
}

export interface AlgorithmMetadata<T extends Algorithm> {
  algorithm: T;
  hashRateMultiplier: HashRate;
}

function buildAlgorithmMetadata<T extends Algorithm>(algo: T): AlgorithmMetadata<T> {
  let hashRate = HashRate.MH;
  if (algo === 'blake2s' || algo === 'blakecoin') {
    hashRate = HashRate.GH;
  } else if (algo === 'yesscript') {
    hashRate = HashRate.KH;
  }

  return {
    algorithm: algo,
    hashRateMultiplier: hashRate,
  };
}

type AlgorithmMetadataDictionary = { [algo in Algorithm]: AlgorithmMetadata<algo> };

export const ALGORITHM_METADATA: AlgorithmMetadataDictionary = {
  blake2s: buildAlgorithmMetadata('blake2s'),
  blakecoin: buildAlgorithmMetadata('blakecoin'),
  cryptonight: buildAlgorithmMetadata('cryptonight'),
  equihash: buildAlgorithmMetadata('equihash'),
  ethash: buildAlgorithmMetadata('ethash'),
  groestl: buildAlgorithmMetadata('groestl'),
  keccak: buildAlgorithmMetadata('keccak'),
  lyra2re2: buildAlgorithmMetadata('lyra2re2'),
  lyra2z: buildAlgorithmMetadata('lyra2z'),
  myriad: buildAlgorithmMetadata('myriad'),
  neoscrypt: buildAlgorithmMetadata('neoscrypt'),
  qubit: buildAlgorithmMetadata('qubit'),
  scrypt: buildAlgorithmMetadata('scrypt'),
  sha256: buildAlgorithmMetadata('sha256'),
  sia: buildAlgorithmMetadata('sia'),
  skein: buildAlgorithmMetadata('skein'),
  x11: buildAlgorithmMetadata('x11'),
  yescrypt: buildAlgorithmMetadata('yescrypt'),
};

export const ALGORITHMS = Object.keys(ALGORITHM_METADATA) as Algorithm[];

export function isAlgorithm(val: string): val is Algorithm {
  return ALGORITHMS.find((a) => a === val) != null;
}
