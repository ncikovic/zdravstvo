import 'dotenv/config';

import knex, { type Knex } from 'knex';

const dbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zdravstvo',
    timezone: 'Z',
  },
  pool: { min: 0, max: 10 },
};

export const db = knex(dbConfig);

export type DatabaseExecutor = Knex | Knex.Transaction;
