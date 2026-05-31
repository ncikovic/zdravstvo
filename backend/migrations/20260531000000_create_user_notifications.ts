import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("notifications", (table) => {
    table.specificType("id", "BINARY(16)").notNullable().primary();
    table.specificType("organization_id", "BINARY(16)").notNullable();
    table.specificType("recipient_user_id", "BINARY(16)").notNullable();
    table.specificType("actor_user_id", "BINARY(16)");
    table
      .enu(
        "type",
        [
          "APPOINTMENT_REQUEST_SUBMITTED",
          "APPOINTMENT_REQUEST_RECEIVED",
          "APPOINTMENT_CONFIRMED",
          "APPOINTMENT_UPDATED",
          "APPOINTMENT_CANCELLED",
          "APPOINTMENT_STATUS_CHANGED",
          "APPOINTMENT_REMINDER",
        ],
        { useNative: true, enumName: "notification_type" },
      )
      .notNullable();
    table.string("title", 160).notNullable();
    table.string("message", 500).notNullable();
    table
      .enu("entity_type", ["APPOINTMENT"], {
        useNative: true,
        enumName: "notification_entity_type",
      })
      .notNullable();
    table.specificType("entity_id", "BINARY(16)").notNullable();
    table.string("event_key", 255).notNullable();
    table.dateTime("read_at", { precision: 3 });
    table.dateTime("created_at", { precision: 3 }).notNullable().defaultTo(knex.fn.now(3));

    table.unique(
      ["organization_id", "recipient_user_id", "event_key"],
      "uq_notifications_event_recipient",
    );
    table.index(
      ["organization_id", "recipient_user_id", "read_at", "created_at"],
      "idx_notifications_recipient",
    );
    table
      .foreign("organization_id")
      .references("id")
      .inTable("organizations")
      .onDelete("CASCADE");
    table
      .foreign("recipient_user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("actor_user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table.engine("InnoDB");
    table.charset("utf8mb4");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("notifications");
}
