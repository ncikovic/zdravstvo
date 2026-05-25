import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasNotesColumn = await knex.schema.hasColumn('patient_profiles', 'notes');

  if (!hasNotesColumn) {
    await knex.schema.alterTable('patient_profiles', (table) => {
      table.text('notes').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasNotesColumn = await knex.schema.hasColumn('patient_profiles', 'notes');

  if (hasNotesColumn) {
    await knex.schema.alterTable('patient_profiles', (table) => {
      table.dropColumn('notes');
    });
  }
}
