function required(envVariable: string): string {
  const val = process.env[envVariable];
  if (val == null || val.trim().length === 0) {
    throw new Error(`process.env.${envVariable} not set, fatal error`);
  }
  return val;
}

function optional(envVariable: string): string | undefined {
  const val = process.env[envVariable];
  if (val == null || val.trim().length === 0 || val === 'N/A') {
    return undefined;
  }
  return val;
}

export const CONFIG = {
  dataUpdateSnsArn: required('DATA_UPDATE_SNS_ARN'),
  firebase: {
    databaseUrl: required('FIREBASE_DATABASE_URL'),
    serviceAccountJson: required('FIREBASE_SERVICE_ACCOUNT_JSON'),
  },
  sentryDSN: optional('SENTRY_DSN'),
  snsConfig: {
    endpoint: optional('SNS_ENDPOINT'),
    region: required('REGION'),
  },
  stageName: required('SERVERLESS_STAGE_NAME'),
};
