import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex("appointments").where("status", "REQUESTED").update({
    status: "SCHEDULED",
  });

  await knex.raw(
    "ALTER TABLE appointments MODIFY status ENUM('SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED'",
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    "ALTER TABLE appointments MODIFY status ENUM('REQUESTED', 'SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED'",
  );
}
