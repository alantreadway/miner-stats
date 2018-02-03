export type SecondsSinceEpoch = number;

export enum TimeGranularity {
  MINUTE = 60,
  HOUR = TimeGranularity.MINUTE * 60,
  DAY = TimeGranularity.HOUR * 24,
}

/**
 * Represents a rolled-up summary of a data-type.
 */
export interface Summary<DataType> {
  timestamp: SecondsSinceEpoch;
  open: DataType;
  close: DataType;
  min: DataType;
  max: DataType;
}

export function floorTimeToGranularity(
  time: SecondsSinceEpoch,
  granularity: TimeGranularity,
): SecondsSinceEpoch {
  return Math.floor(time - (time % granularity));
}
