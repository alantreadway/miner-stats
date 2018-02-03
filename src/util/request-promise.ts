import { CoreOptions } from 'request';
import * as rp from 'request-promise-native';

export async function get<T>(uri: string, options?: CoreOptions): Promise<T> {
  return rp(uri, { ...options, gzip: true }).promise();
}
