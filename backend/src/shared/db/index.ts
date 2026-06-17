export * from "./connection.js";

import type { Knex } from "knex";

export type DatabaseExecutor = Knex | Knex.Transaction;
