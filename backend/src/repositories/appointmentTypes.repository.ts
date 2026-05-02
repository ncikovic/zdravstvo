import type {
  CreateAppointmentTypeRequestDto,
  UpdateAppointmentTypeRequestDto,
} from '@zdravstvo/contracts';
import type { Buffer } from 'node:buffer';

import { db } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';
import type { AppointmentType } from '../types/entities/index.js';

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
}

const TABLE_NAME = 'appointment_types';

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
  record: CreateAppointmentTypeRecord
): Record<string, unknown> => ({
  id: uuidToBuffer(record.id),
  organization_id: uuidToBuffer(record.organizationId),
  name: record.name,
  default_duration_minutes: record.defaultDurationMinutes,
  is_active: record.isActive ?? true,
});

const buildUpdatePayload = (
  record: UpdateAppointmentTypeRequestDto
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if ('organizationId' in record && record.organizationId) {
    payload.organization_id = uuidToBuffer(record.organizationId);
  }

  if ('name' in record) {
    payload.name = record.name;
  }

  if ('defaultDurationMinutes' in record) {
    payload.default_duration_minutes = record.defaultDurationMinutes;
  }

  if ('isActive' in record) {
    payload.is_active = record.isActive;
  }

  return payload;
};

export const appointmentTypesRepository = {
  async findAll(): Promise<AppointmentType[]> {
    const rows = await db<AppointmentTypeRow>(TABLE_NAME)
      .select('*')
      .orderBy('name', 'asc');

    return rows.map(toAppointmentType);
  },

  async findById(id: string): Promise<AppointmentType | null> {
    const row = await db<AppointmentTypeRow>(TABLE_NAME)
      .where({ id: uuidToBuffer(id) })
      .first();

    return row ? toAppointmentType(row) : null;
  },

  async create(record: CreateAppointmentTypeRecord): Promise<AppointmentType> {
    await db(TABLE_NAME).insert(buildInsertPayload(record));

    const appointmentType = await appointmentTypesRepository.findById(record.id);

    if (!appointmentType) {
      throw new Error('Appointment type was not created.');
    }

    return appointmentType;
  },

  async update(
    id: string,
    record: UpdateAppointmentTypeRequestDto
  ): Promise<AppointmentType | null> {
    const affectedRows = await db(TABLE_NAME)
      .where({ id: uuidToBuffer(id) })
      .update(buildUpdatePayload(record));

    if (affectedRows === 0) {
      return null;
    }

    return appointmentTypesRepository.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const affectedRows = await db(TABLE_NAME)
      .where({ id: uuidToBuffer(id) })
      .delete();

    return affectedRows > 0;
  },
};
