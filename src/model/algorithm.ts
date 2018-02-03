export type Algorithm =
  'sha256' |
  'ethash' |
  'equihash' |
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

const ALGORITHMS: Algorithm[] = [
  'sha256',
  'ethash',
  'equihash',
  'lyra2re2',
  'lyra2z',
  'neoscrypt',
  'groestl',
  'keccak',
  'skein',
  'cryptonight',
  'myriad',
  'yescrypt',
  'qubit',
  'sia',
  'scrypt',
  'x11',
];

export function isAlgorithm(val: string): val is Algorithm {
  return ALGORITHMS.find((a) => a === val) != null;
}
