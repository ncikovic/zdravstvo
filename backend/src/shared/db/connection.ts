import "dotenv/config";
import knex, { type Knex } from "knex";

const DEFAULT_DATABASE_PORT = 3306;
const DEFAULT_POOL_SIZE = 10;

const resolveDatabasePort = (value: string | undefined): number => {
  const parsedValue = Number(value ?? DEFAULT_DATABASE_PORT);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : DEFAULT_DATABASE_PORT;
};

export const db: Knex = knex({
  client: process.env.DB_CLIENT ?? "mysql2",
  connection: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: resolveDatabasePort(process.env.DB_PORT),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "zdravstvo",
    timezone: "Z",
  },
  pool: {
    min: 0,
    max: DEFAULT_POOL_SIZE,
  },
});
