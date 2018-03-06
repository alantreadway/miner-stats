import * as fs from 'fs';
import * as yaml from 'js-yaml';

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

type Base64EncodedSecretString = string;

interface SecretsFile {
  secrets: {
    FIREBASE_CREDENTIALS: Base64EncodedSecretString;
  };
  keyArn: string;
}

let loadedSecrets: SecretsFile | undefined;

export const CONFIG = {
  corsOrigin: required('CORS_ORIGIN'),
  dataUpdateSnsArn: required('DATA_UPDATE_SNS_ARN'),
  firebase: {
    credentials: async (): Promise<Base64EncodedSecretString> => {
      return (await CONFIG.secrets()).secrets.FIREBASE_CREDENTIALS;
    },
    databaseUrl: required('FIREBASE_DATABASE_URL'),
  },
  kmsConfig: {
    region: required('REGION'),
  },
  secrets: async (): Promise<SecretsFile> => {
    if (loadedSecrets == null) {
      const secretsBuffer = fs.readFileSync(CONFIG.secretsFile);
      loadedSecrets = yaml.safeLoad(secretsBuffer.toString());
    }
    return loadedSecrets!;
  },
  secretsFile: required('SECRETS_FILE'),
  sentryDSN: optional('SENTRY_DSN'),
  snsConfig: {
    endpoint: optional('SNS_ENDPOINT'),
    region: required('REGION'),
  },
  stageName: required('SERVERLESS_STAGE_NAME'),
};
