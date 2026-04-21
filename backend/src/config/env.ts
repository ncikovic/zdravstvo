import 'dotenv/config';

import { AppEnvironment } from '@zdravstvo/contracts';

const DEFAULT_PORT = 3001;
const DEFAULT_JWT_ACCESS_TOKEN_EXPIRES_IN = '1h';

const resolveJwtSecret = (
  value: string | undefined,
  nodeEnv: AppEnvironment
): string => {
  if (value && value.trim().length > 0) {
    return value;
  }

  if (nodeEnv !== AppEnvironment.Production) {
    return 'zdravstvo-dev-secret';
  }

  throw new Error('JWT_SECRET must be configured in production.');
};

const resolveNodeEnv = (value: string | undefined): AppEnvironment => {
  if (value && Object.values(AppEnvironment).includes(value as AppEnvironment)) {
    return value as AppEnvironment;
  }

  return AppEnvironment.Development;
};

const resolvePort = (value: string | undefined): number => {
  const parsedPort = Number(value ?? DEFAULT_PORT);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    return DEFAULT_PORT;
  }

  return parsedPort;
};

const nodeEnv = resolveNodeEnv(process.env.NODE_ENV);

export const env = {
  nodeEnv,
  port: resolvePort(process.env.PORT),
  jwtSecret: resolveJwtSecret(process.env.JWT_SECRET, nodeEnv),
  jwtAccessTokenExpiresIn:
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN?.trim() ||
    DEFAULT_JWT_ACCESS_TOKEN_EXPIRES_IN,
};
