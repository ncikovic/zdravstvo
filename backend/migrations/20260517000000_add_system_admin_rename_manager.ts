import type { Knex } from 'knex';

export async function up(knex: Knex) {
  const hasColumn = await knex.schema.hasColumn('users', 'is_system_admin');
  if (!hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.specificType('is_system_admin', 'TINYINT(1)').notNullable().defaultTo(0).after('password_hash');
    });
  }

  // Check whether ADMIN still needs to be renamed to MANAGER.
  const [[roleCol]] = await knex.raw(`
    SELECT COLUMN_TYPE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'organization_users'
      AND COLUMN_NAME = 'role'
  `);
  const needsRename = (roleCol.COLUMN_TYPE as string).includes("'ADMIN'");

  if (needsRename) {
    // Temporarily widen the enum to accept both values while migrating data.
    await knex.raw(`
      ALTER TABLE organization_users
      MODIFY COLUMN role ENUM('ADMIN','MANAGER','RECEPTION','DOCTOR','PATIENT') NOT NULL
    `);
    await knex('organization_users').where('role', 'ADMIN').update({ role: 'MANAGER' });
    await knex.raw(`
      ALTER TABLE organization_users
      MODIFY COLUMN role ENUM('MANAGER','RECEPTION','DOCTOR','PATIENT') NOT NULL
    `);
  }
}

export async function down(knex: Knex) {
  await knex.raw(`
    ALTER TABLE organization_users
    MODIFY COLUMN role ENUM('ADMIN','RECEPTION','DOCTOR','PATIENT') NOT NULL
  `);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('is_system_admin');
  });
}
