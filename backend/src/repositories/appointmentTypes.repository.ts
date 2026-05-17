import type {
  CreateAppointmentTypeRequestDto,
  UpdateAppointmentTypeRequestDto,
} from "@zdravstvo/contracts";
import type { Buffer } from "node:buffer";

import { db } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";
import type { AppointmentType } from "../types/entities/index.js";

interface AppointmentTypeRow {
  id: Buffer | Uint8Array | string;
  organization_id: Buffer | Uint8Array | string;
  name: string;
  default_duration_minutes: number;
  is_active: boolean | number;
  created_at: Date | string;
}

interface CreateAppointmentTypeRecord extends CreateAppointmentTypeRequestDto {
  id: string;
  organizationId: string;
}

const TABLE_NAME = "appointment_types";

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const toAppointmentType = (row: AppointmentTypeRow): AppointmentType => ({
  id: bufferToUuid(row.id),
  organizationId: bufferToUuid(row.organization_id),
  name: row.name,
  defaultDurationMinutes: row.default_duration_minutes,
  isActive: Boolean(row.is_active),
  createdAt: toDate(row.created_at),
});

const buildInsertPayload = (
  record: CreateAppointmentTypeRecord,
): Record<string, unknown> => ({
  id: uuidToBuffer(record.id),
  organization_id: uuidToBuffer(record.organizationId),
  name: record.name,
  default_duration_minutes: record.defaultDurationMinutes,
  is_active: record.isActive ?? true,
});

const buildUpdatePayload = (
  record: UpdateAppointmentTypeRequestDto,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if ("name" in record) {
    payload.name = record.name;
  }

  if ("defaultDurationMinutes" in record) {
    payload.default_duration_minutes = record.defaultDurationMinutes;
  }

  if ("isActive" in record) {
    payload.is_active = record.isActive;
  }

  return payload;
};

export const appointmentTypesRepository = {
  async countAllByOrganization(organizationId: string): Promise<number> {
    const result = (await db(TABLE_NAME)
      .where({ organization_id: uuidToBuffer(organizationId) })
      .count("* as count")
      .first()) as { count: number | string };

    return Number(result.count);
  },

  async findAllByOrganization(
    organizationId: string,
    pagination?: { limit: number; offset: number },
  ): Promise<AppointmentType[]> {
    const query = db<AppointmentTypeRow>(TABLE_NAME)
      .select("*")
      .where({ organization_id: uuidToBuffer(organizationId) })
      .orderBy("name", "asc");

    if (pagination) {
      query.limit(pagination.limit).offset(pagination.offset);
    }

    const rows = await query;

    return rows.map(toAppointmentType);
  },

  async findById(
    organizationId: string,
    id: string,
  ): Promise<AppointmentType | null> {
    const row = await db<AppointmentTypeRow>(TABLE_NAME)
      .where({
        id: uuidToBuffer(id),
        organization_id: uuidToBuffer(organizationId),
      })
      .first();

    return row ? toAppointmentType(row) : null;
  },

  async create(record: CreateAppointmentTypeRecord): Promise<AppointmentType> {
    await db(TABLE_NAME).insert(buildInsertPayload(record));

    const appointmentType = await appointmentTypesRepository.findById(
      record.organizationId,
      record.id,
    );

    if (!appointmentType) {
      throw new Error("Appointment type was not created.");
    }

    return appointmentType;
  },

  async update(
    id: string,
    organizationId: string,
    record: UpdateAppointmentTypeRequestDto,
  ): Promise<AppointmentType | null> {
    const affectedRows = await db(TABLE_NAME)
      .where({
        id: uuidToBuffer(id),
        organization_id: uuidToBuffer(organizationId),
      })
      .update(buildUpdatePayload(record));

    if (affectedRows === 0) {
      return null;
    }

    return appointmentTypesRepository.findById(organizationId, id);
  },

  async delete(organizationId: string, id: string): Promise<boolean> {
    const affectedRows = await db(TABLE_NAME)
      .where({
        id: uuidToBuffer(id),
        organization_id: uuidToBuffer(organizationId),
      })
      .delete();

    return affectedRows > 0;
  },
};
