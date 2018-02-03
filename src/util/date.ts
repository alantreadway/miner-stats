import { SecondsSinceEpoch } from 'util/time-series';

export function getCurrentTimeInMilliseconds(): number {
  return Date.now();
}

export function getCurrentTimeInSeconds(): SecondsSinceEpoch {
  return Math.round(getCurrentTimeInMilliseconds() / 1000);
}
