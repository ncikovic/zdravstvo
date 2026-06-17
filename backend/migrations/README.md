Zdravstvo backend migrations use Knex with MySQL 8+ (config in `knexfile.ts` and env vars `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

- Apply latest migrations (TS via tsx): `pnpm --filter @zdravstvo/backend run migrate:latest`
- Roll back last batch: `pnpm --filter @zdravstvo/backend run migrate:rollback`
