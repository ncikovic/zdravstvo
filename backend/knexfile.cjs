require('dotenv/config');

const DEFAULT_DATABASE_PORT = 3306;

const databasePort = Number(process.env.DB_PORT ?? DEFAULT_DATABASE_PORT);

/** @type {import('knex').Knex.Config} */
module.exports = {
  client: process.env.DB_CLIENT ?? 'mysql2',
  connection: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number.isInteger(databasePort) ? databasePort : DEFAULT_DATABASE_PORT,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'zdravstvo',
  },
  migrations: {
    directory: './migrations',
    extension: 'cjs',
  },
};
