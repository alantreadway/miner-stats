import '3pmodules';

import { createLogger, DEBUG, stdSerializers, Stream } from 'bunyan';
import { SentryStream } from 'bunyan-sentry-stream';
import * as raven from 'raven';

import { CONFIG } from 'config';

function buildStreams(): Stream[] {
  const result: Stream[] = [{ stream: process.stdout }];
  if (CONFIG.sentryDSN != null) {
    const client = raven
      .config(
      CONFIG.sentryDSN,
      {
        autoBreadcrumbs: true,
        environment: process.env.ENV,
        release: process.env.GIT_HASH,
      },
    )
      .install();

    result.push({
      level: 'warn',
      stream: new SentryStream(client),
      type: 'raw',
    });
  }

  return result;
}

export const LOGGER = createLogger({
  level: DEBUG,
  name: 'miner-stats-' + CONFIG.stageName,
  serializers: stdSerializers,
  src: true,
  streams: buildStreams(),
});
