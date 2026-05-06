import type {
  CreatePatientRequestDto,
  UpdatePatientRequestDto,
  UserStatus,
} from "@zdravstvo/contracts";
import type { Buffer } from "node:buffer";

import { db } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";
import type { Patient } from "../types/entities/index.js";

interface PatientRow {
  user_id: Buffer | Uint8Array | string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  first_name: string;
  last_name: string;
  date_of_birth: Date | string | null;
  oib: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface CreatePatientRecord extends CreatePatientRequestDto {
  id: string;
}

const TABLE_NAME = "patient_profiles";

const PATIENT_COLUMNS = [
  "patient.user_id",
  "user.email",
  "user.phone",
  "user.status",
  "patient.first_name",
  "patient.last_name",
  "patient.date_of_birth",
  "patient.oib",
  "patient.address",
  "patient.emergency_contact_name",
  "patient.emergency_contact_phone",
  "patient.created_at",
  "patient.updated_at",
] as const;

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const toNullableDate = (value: Date | string | null): Date | null =>
  value === null ? null : toDate(value);

const toPatient = (row: PatientRow): Patient => ({
  id: bufferToUuid(row.user_id),
  email: row.email,
  phone: row.phone,
  status: row.status,
  firstName: row.first_name,
  lastName: row.last_name,
  dateOfBirth: toNullableDate(row.date_of_birth),
  oib: row.oib,
  address: row.address,
  emergencyContactName: row.emergency_contact_name,
  emergencyContactPhone: row.emergency_contact_phone,
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

const buildInsertPayload = (
  record: CreatePatientRecord,
): Record<string, unknown> => ({
  user_id: uuidToBuffer(record.id),
  first_name: record.firstName,
  last_name: record.lastName,
  date_of_birth: record.dateOfBirth ?? null,
  oib: record.oib ?? null,
  address: record.address ?? null,
  emergency_contact_name: record.emergencyContactName ?? null,
  emergency_contact_phone: record.emergencyContactPhone ?? null,
});

const buildUpdatePayload = (
  record: UpdatePatientRequestDto,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    updated_at: db.fn.now(),
  };

  if ("firstName" in record) {
    payload.first_name = record.firstName;
  }

  if ("lastName" in record) {
    payload.last_name = record.lastName;
  }

  if ("dateOfBirth" in record) {
    payload.date_of_birth = record.dateOfBirth ?? null;
  }

  if ("oib" in record) {
    payload.oib = record.oib ?? null;
  }

  if ("address" in record) {
    payload.address = record.address ?? null;
  }

  if ("emergencyContactName" in record) {
    payload.emergency_contact_name = record.emergencyContactName ?? null;
  }

  if ("emergencyContactPhone" in record) {
    payload.emergency_contact_phone = record.emergencyContactPhone ?? null;
  }

  return payload;
};

export const patientsRepository = {
  async findAll(): Promise<Patient[]> {
    const rows = await db<PatientRow>(`${TABLE_NAME} as patient`)
      .innerJoin("users as user", "user.id", "patient.user_id")
      .select(...PATIENT_COLUMNS)
      .orderBy("patient.last_name", "asc")
      .orderBy("patient.first_name", "asc");

    return rows.map(toPatient);
  },

  async findById(id: string): Promise<Patient | null> {
    const row = await db<PatientRow>(`${TABLE_NAME} as patient`)
      .innerJoin("users as user", "user.id", "patient.user_id")
      .select(...PATIENT_COLUMNS)
      .where({ "patient.user_id": uuidToBuffer(id) })
      .first();

    return row ? toPatient(row) : null;
  },

  async create(record: CreatePatientRecord): Promise<Patient> {
    await db.transaction(async (trx) => {
      await trx("users").insert({
        id: uuidToBuffer(record.id),
        email: record.email ?? null,
        phone: record.phone ?? null,
        password_hash: null,
        status: record.status ?? "ACTIVE",
      });

      await trx(TABLE_NAME).insert(buildInsertPayload(record));
    });

    const patient = await patientsRepository.findById(record.id);

    if (!patient) {
      throw new Error("Patient was not created.");
    }

    return patient;
  },

  async update(
    id: string,
    record: UpdatePatientRequestDto,
  ): Promise<Patient | null> {
    const affectedRows = await db.transaction<number>(async (trx) => {
      const userPayload: Record<string, unknown> = {};

      if ("email" in record) {
        userPayload.email = record.email ?? null;
      }

      if ("phone" in record) {
        userPayload.phone = record.phone ?? null;
      }

      if ("status" in record) {
        userPayload.status = record.status ?? "ACTIVE";
      }

      if (Object.keys(userPayload).length > 0) {
        await trx("users")
          .where({ id: uuidToBuffer(id) })
          .update(userPayload);
      }

      const patientAffectedRows = await trx(TABLE_NAME)
        .where({ user_id: uuidToBuffer(id) })
        .update(buildUpdatePayload(record));

      return patientAffectedRows;
    });

    if (affectedRows === 0) {
      return null;
    }

    return patientsRepository.findById(id);
  },

  async delete(id: string): Promise<boolean> {
    const affectedRows = await db(TABLE_NAME)
      .where({ user_id: uuidToBuffer(id) })
      .delete();

    return affectedRows > 0;
  },
};
