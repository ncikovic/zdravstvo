import type { Knex } from 'knex';

export async function up(knex: Knex) {
  const hasColumn = await knex.schema.hasColumn('organizations', 'is_active');
  if (!hasColumn) {
    await knex.schema.alterTable('organizations', (table) => {
      table.specificType('is_active', 'TINYINT(1)').notNullable().defaultTo(1);
    });
  }
}

export async function down(knex: Knex) {
  await knex.schema.alterTable('organizations', (table) => {
    table.dropColumn('is_active');
  });
}
