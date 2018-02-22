import * as schema from 'util/schema';

export type Algorithm = schema.Algorithm;

export const enum HashRate {
  H = 1,
  KH = 1e3,
  GH = 1e9,
  MH = 1e6,
  TH = 1e12,
  PH = 1e15,
}

export interface AlgorithmMetadata<T extends schema.Algorithm> {
  algorithm: T;
  hashRateMultiplier: {
    [key in schema.Pool]: HashRate;
  };
}

function buildAlgorithmMetadata<T extends schema.Algorithm>(algo: T): AlgorithmMetadata<T> {
  let hashRateMultiplier: AlgorithmMetadata<'blake2s'>['hashRateMultiplier'] = {
    ahashpool: HashRate.MH,
    miningpoolhub: HashRate.MH,
    nanopool: HashRate.MH,
    nicehash: HashRate.MH,
  };
  switch (algo) {
    case 'blake2s':
    case 'blakecoin':
    case 'quark':
    case 'qubit':
    case 'x11':
      hashRateMultiplier.ahashpool = HashRate.GH;
      break;

    case 'cryptonight':
      hashRateMultiplier.nanopool = HashRate.H;
      break;

    case 'equihash':
      hashRateMultiplier.nanopool = HashRate.H;
      break;

    case 'yesscript':
      hashRateMultiplier.ahashpool = HashRate.KH;
      break;

    default:
  }

  return {
    algorithm: algo,
    hashRateMultiplier,
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
