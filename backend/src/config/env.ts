import 'dotenv/config';

import { AppEnvironment } from '@zdravstvo/contracts';

const DEFAULT_PORT = 3001;

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

export const env = {
  nodeEnv: resolveNodeEnv(process.env.NODE_ENV),
  port: resolvePort(process.env.PORT),
};
