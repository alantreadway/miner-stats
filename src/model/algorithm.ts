import * as schema from 'util/schema';

export type Algorithm = schema.Algorithm;

const enum HashRate {
  KH = 1e3,
  GH = 1e9,
  MH = 1e6,
  TH = 1e12,
  PH = 1e15,
}

export interface AlgorithmMetadata<T extends schema.Algorithm> {
  algorithm: T;
  hashRateMultiplier: HashRate;
}

function buildAlgorithmMetadata<T extends schema.Algorithm>(algo: T): AlgorithmMetadata<T> {
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

type AlgorithmMetadataDictionary = { [algo in schema.Algorithm]: AlgorithmMetadata<algo> };

export const ALGORITHM_METADATA = schema.ALL_ALGORITHMS.reduce(
  (result, next): AlgorithmMetadataDictionary => {
    // tslint:disable-next-line:no-any
    result[next] = buildAlgorithmMetadata(next) as any;
    return result;
  },
  {} as AlgorithmMetadataDictionary,
);

export const ALGORITHMS = schema.ALL_ALGORITHMS;

export function isAlgorithm(val: string): val is schema.Algorithm {
  return ALGORITHMS.find((a) => a === val) != null;
}
