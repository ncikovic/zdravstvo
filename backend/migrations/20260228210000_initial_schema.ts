import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.schema.createTable('organizations', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.string('name', 255).notNullable();
    table.string('address', 255);
    table.string('city', 120);
    table.string('phone', 60);
    table.string('email', 255);
    table.string('timezone', 64).notNullable().defaultTo('Europe/Zagreb');
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table.index(['name'], 'idx_org_name');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('users', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.string('email', 255);
    table.string('phone', 60);
    table.string('password_hash', 255);
    table.enu('status', ['ACTIVE', 'DISABLED'], { useNative: true }).notNullable().defaultTo('ACTIVE');
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table.unique(['email'], 'uq_users_email');
    table.unique(['phone'], 'uq_users_phone');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('organization_users', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('user_id', 'BINARY(16)').notNullable();
    table.enu('role', ['ADMIN', 'RECEPTION', 'DOCTOR', 'PATIENT'], { useNative: true }).notNullable();
    table.boolean('is_active').notNullable().defaultTo(1);
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table.unique(['organization_id', 'user_id'], 'uq_org_user');
    table.index(['organization_id', 'role'], 'idx_org_users_org_role');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('patient_profiles', (table) => {
    table.specificType('user_id', 'BINARY(16)').notNullable().primary();
    table.string('first_name', 120).notNullable();
    table.string('last_name', 120).notNullable();
    table.date('date_of_birth');
    table.string('oib', 32);
    table.string('address', 255);
    table.string('emergency_contact_name', 120);
    table.string('emergency_contact_phone', 60);
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table.unique(['oib'], 'uq_patient_oib');
    table.index(['last_name', 'first_name'], 'idx_patient_name');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('doctor_profiles', (table) => {
    table.specificType('user_id', 'BINARY(16)').notNullable().primary();
    table.string('first_name', 120).notNullable();
    table.string('last_name', 120).notNullable();
    table.string('title', 120);
    table.string('license_number', 64);
    table.text('bio');
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table.unique(['license_number'], 'uq_doctor_license');
    table.index(['last_name', 'first_name'], 'idx_doctor_name');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('organization_doctors', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('doctor_user_id', 'BINARY(16)').notNullable();
    table.boolean('is_active').notNullable().defaultTo(1);
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table.unique(['organization_id', 'doctor_user_id'], 'uq_org_doctor');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table
      .foreign('doctor_user_id')
      .references('user_id')
      .inTable('doctor_profiles')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('doctor_working_hours', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('doctor_user_id', 'BINARY(16)').notNullable();
    table.specificType('day_of_week', 'TINYINT').notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.boolean('is_off').notNullable().defaultTo(0);
    table.unique(['organization_id', 'doctor_user_id', 'day_of_week'], 'uq_doc_day');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table
      .foreign('doctor_user_id')
      .references('user_id')
      .inTable('doctor_profiles')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('doctor_time_off', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('doctor_user_id', 'BINARY(16)').notNullable();
    table.dateTime('start_at', { precision: 3 }).notNullable();
    table.dateTime('end_at', { precision: 3 }).notNullable();
    table.string('reason', 255);
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table.index(['organization_id', 'doctor_user_id', 'start_at'], 'idx_timeoff_doc');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table
      .foreign('doctor_user_id')
      .references('user_id')
      .inTable('doctor_profiles')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('appointment_types', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.string('name', 120).notNullable();
    table.integer('default_duration_minutes').notNullable();
    table.boolean('is_active').notNullable().defaultTo(1);
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table.unique(['organization_id', 'name'], 'uq_type');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('appointments', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('doctor_user_id', 'BINARY(16)').notNullable();
    table.specificType('patient_user_id', 'BINARY(16)').notNullable();
    table.specificType('appointment_type_id', 'BINARY(16)').notNullable();
    table.dateTime('start_at', { precision: 3 }).notNullable();
    table.dateTime('end_at', { precision: 3 }).notNullable();
    table
      .enu('status', ['SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], { useNative: true })
      .notNullable()
      .defaultTo('SCHEDULED');
    table.specificType('created_by_org_user_id', 'BINARY(16)').notNullable();
    table.specificType('updated_by_org_user_id', 'BINARY(16)');
    table.string('cancellation_reason', 255);
    table.text('notes');
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table.index(['organization_id', 'doctor_user_id', 'start_at'], 'idx_doc_time');
    table.index(['organization_id', 'patient_user_id', 'start_at'], 'idx_patient_time');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table.foreign('doctor_user_id').references('user_id').inTable('doctor_profiles');
    table.foreign('patient_user_id').references('user_id').inTable('patient_profiles');
    table.foreign('appointment_type_id').references('id').inTable('appointment_types');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.raw(
    'ALTER TABLE appointments ADD CONSTRAINT chk_appointments_end_after_start CHECK (end_at > start_at)'
  );

  await knex.schema.createTable('appointment_reminders', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('appointment_id', 'BINARY(16)').notNullable();
    table.enu('channel', ['EMAIL', 'SMS'], { useNative: true }).notNullable();
    table.dateTime('scheduled_for', { precision: 3 }).notNullable();
    table.dateTime('sent_at', { precision: 3 });
    table.enu('status', ['PENDING', 'SENT', 'FAILED'], { useNative: true }).notNullable().defaultTo('PENDING');
    table.integer('attempt_count').notNullable().defaultTo(0);
    table.text('last_error');
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table.index(['status', 'scheduled_for'], 'idx_reminder_status');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table
      .foreign('appointment_id')
      .references('id')
      .inTable('appointments')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('activity_log', (table) => {
    table.specificType('id', 'BINARY(16)').notNullable().primary();
    table.specificType('organization_id', 'BINARY(16)').notNullable();
    table.specificType('actor_org_user_id', 'BINARY(16)').notNullable();
    table
      .enu('entity_type', ['APPOINTMENT', 'TYPE', 'DOCTOR', 'ORG_SETTINGS', 'PATIENT'], { useNative: true })
      .notNullable();
    table.enu('action', ['CREATE', 'UPDATE', 'CANCEL', 'STATUS_CHANGE'], { useNative: true }).notNullable();
    table.specificType('entity_id', 'BINARY(16)').notNullable();
    table.json('metadata');
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table.index(['organization_id', 'created_at'], 'idx_activity_org_time');
    table
      .foreign('organization_id')
      .references('id')
      .inTable('organizations')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });

  await knex.schema.createTable('user_accessibility_settings', (table) => {
    table.specificType('user_id', 'BINARY(16)').notNullable().primary();
    table.decimal('font_scale', 3, 2).notNullable().defaultTo(1.0);
    table.boolean('high_contrast').notNullable().defaultTo(0);
    table.boolean('simple_mode').notNullable().defaultTo(0);
    table.boolean('voice_confirmations').notNullable().defaultTo(0);
    table.dateTime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));
    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)'));
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8mb4');
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists('user_accessibility_settings');
  await knex.schema.dropTableIfExists('activity_log');
  await knex.schema.dropTableIfExists('appointment_reminders');
  await knex.schema.dropTableIfExists('appointments');
  await knex.schema.dropTableIfExists('appointment_types');
  await knex.schema.dropTableIfExists('doctor_time_off');
  await knex.schema.dropTableIfExists('doctor_working_hours');
  await knex.schema.dropTableIfExists('organization_doctors');
  await knex.schema.dropTableIfExists('doctor_profiles');
  await knex.schema.dropTableIfExists('patient_profiles');
  await knex.schema.dropTableIfExists('organization_users');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('organizations');
}
