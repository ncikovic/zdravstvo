import type { AppointmentStatusDto } from "@zdravstvo/contracts";
import type { Knex } from "knex";
import type { Buffer } from "node:buffer";
import { v4 as uuidv4 } from "uuid";

import type { DatabaseExecutor } from "../shared/db/index.js";
import { db } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";
import type {
  AppointmentConflictRecord,
  AppointmentDoctorRecord,
  AppointmentOrganizationRecord,
  AppointmentPatientRecord,
  AppointmentRecord,
  AppointmentTimeOffRecord,
  AppointmentTypeRecord,
  AppointmentWorkingHourRecord,
} from "../types/entities/index.js";

export interface FindAppointmentsInput {
  organizationId: string;
  startAt?: Date;
  endAt?: Date;
  doctorUserId?: string;
  patientUserId?: string;
  status?: AppointmentStatusDto;
  limit: number;
}

export interface FindConflictingAppointmentsInput {
  organizationId: string;
  doctorUserId: string;
  patientUserId: string;
  startAt: Date;
  endAt: Date;
  excludeAppointmentId?: string;
  lockForUpdate?: boolean;
}

export interface CreateAppointmentInput {
  organizationId: string;
  doctorUserId: string;
  patientUserId: string;
  appointmentTypeId: string;
  startAt: Date;
  endAt: Date;
  createdByOrgUserId: string;
  notes: string | null;
}

export interface UpdateAppointmentScheduleInput {
  doctorUserId?: string;
  appointmentTypeId?: string;
  startAt?: Date;
  endAt?: Date;
  updatedByOrgUserId: string;
  notes?: string | null;
}

export interface CancelAppointmentInput {
  updatedByOrgUserId: string;
  cancellationReason: string;
}

interface DateLikeRow {
  start_at: Date | string;
  end_at: Date | string;
}

interface OrganizationRow {
  id: Buffer | Uint8Array | string;
  timezone: string;
}

interface DoctorRow {
  user_id: Buffer | Uint8Array | string;
  first_name: string;
  last_name: string;
  title: string | null;
  is_active: boolean | number;
}

interface PatientRow {
  user_id: Buffer | Uint8Array | string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | string | null;
  oib: string | null;
}

interface AppointmentTypeRow {
  id: Buffer | Uint8Array | string;
  name: string;
  default_duration_minutes: number;
  is_active: boolean | number;
}

interface AppointmentWorkingHourRow {
  id: Buffer | Uint8Array | string;
  doctor_user_id: Buffer | Uint8Array | string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_off: boolean | number;
}

interface AppointmentTimeOffRow extends DateLikeRow {
  id: Buffer | Uint8Array | string;
  doctor_user_id: Buffer | Uint8Array | string;
}

interface AppointmentConflictRow extends DateLikeRow {
  id: Buffer | Uint8Array | string;
  doctor_user_id: Buffer | Uint8Array | string;
  patient_user_id: Buffer | Uint8Array | string;
}

interface AppointmentRow extends DateLikeRow {
  id: Buffer | Uint8Array | string;
  organization_id: Buffer | Uint8Array | string;
  status: AppointmentStatusDto;
  notes: string | null;
  cancellation_reason: string | null;
  created_by_org_user_id: Buffer | Uint8Array | string;
  updated_by_org_user_id: Buffer | Uint8Array | string | null;
  created_at: Date | string;
  updated_at: Date | string;
  doctor_user_id: Buffer | Uint8Array | string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_title: string | null;
  doctor_is_active: boolean | number;
  patient_user_id: Buffer | Uint8Array | string;
  patient_first_name: string;
  patient_last_name: string;
  patient_date_of_birth: Date | string | null;
  patient_oib: string | null;
  appointment_type_id: Buffer | Uint8Array | string;
  appointment_type_name: string;
  default_duration_minutes: number;
  appointment_type_is_active: boolean | number;
}

const APPOINTMENT_COLUMNS = [
  "appointment.id as id",
  "appointment.organization_id as organization_id",
  "appointment.start_at as start_at",
  "appointment.end_at as end_at",
  "appointment.status as status",
  "appointment.notes as notes",
  "appointment.cancellation_reason as cancellation_reason",
  "appointment.created_by_org_user_id as created_by_org_user_id",
  "appointment.updated_by_org_user_id as updated_by_org_user_id",
  "appointment.created_at as created_at",
  "appointment.updated_at as updated_at",
  "doctor.user_id as doctor_user_id",
  "doctor.first_name as doctor_first_name",
  "doctor.last_name as doctor_last_name",
  "doctor.title as doctor_title",
  "organizationDoctor.is_active as doctor_is_active",
  "patient.user_id as patient_user_id",
  "patient.first_name as patient_first_name",
  "patient.last_name as patient_last_name",
  "patient.date_of_birth as patient_date_of_birth",
  "patient.oib as patient_oib",
  "appointmentType.id as appointment_type_id",
  "appointmentType.name as appointment_type_name",
  "appointmentType.default_duration_minutes as default_duration_minutes",
  "appointmentType.is_active as appointment_type_is_active",
] as const;

const mapDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

const mapNullableDate = (value: Date | string | null): Date | null => {
  return value === null ? null : mapDate(value);
};

const mapOrganizationRecord = (
  row: OrganizationRow,
): AppointmentOrganizationRecord => {
  return {
    id: bufferToUuid(row.id),
    timezone: row.timezone,
  };
};

const mapDoctorRecord = (row: DoctorRow): AppointmentDoctorRecord => {
  return {
    id: bufferToUuid(row.user_id),
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    isActive: Boolean(row.is_active),
  };
};

const mapPatientRecord = (row: PatientRow): AppointmentPatientRecord => {
  return {
    id: bufferToUuid(row.user_id),
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: mapNullableDate(row.date_of_birth),
    oib: row.oib,
  };
};

const mapAppointmentTypeRecord = (
  row: AppointmentTypeRow,
): AppointmentTypeRecord => {
  return {
    id: bufferToUuid(row.id),
    name: row.name,
    defaultDurationMinutes: row.default_duration_minutes,
    isActive: Boolean(row.is_active),
  };
};

const mapWorkingHourRecord = (
  row: AppointmentWorkingHourRow,
): AppointmentWorkingHourRecord => {
  return {
    id: bufferToUuid(row.id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    isOff: Boolean(row.is_off),
  };
};

const mapTimeOffRecord = (
  row: AppointmentTimeOffRow,
): AppointmentTimeOffRecord => {
  return {
    id: bufferToUuid(row.id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    startAt: mapDate(row.start_at),
    endAt: mapDate(row.end_at),
  };
};

const mapConflictRecord = (
  row: AppointmentConflictRow,
): AppointmentConflictRecord => {
  return {
    id: bufferToUuid(row.id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    patientUserId: bufferToUuid(row.patient_user_id),
    startAt: mapDate(row.start_at),
    endAt: mapDate(row.end_at),
  };
};

const mapAppointmentRecord = (row: AppointmentRow): AppointmentRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    startAt: mapDate(row.start_at),
    endAt: mapDate(row.end_at),
    status: row.status,
    notes: row.notes,
    cancellationReason: row.cancellation_reason,
    createdByOrgUserId: bufferToUuid(row.created_by_org_user_id),
    updatedByOrgUserId: row.updated_by_org_user_id
      ? bufferToUuid(row.updated_by_org_user_id)
      : null,
    createdAt: mapDate(row.created_at),
    updatedAt: mapDate(row.updated_at),
    doctor: {
      id: bufferToUuid(row.doctor_user_id),
      firstName: row.doctor_first_name,
      lastName: row.doctor_last_name,
      title: row.doctor_title,
      isActive: Boolean(row.doctor_is_active),
    },
    patient: {
      id: bufferToUuid(row.patient_user_id),
      firstName: row.patient_first_name,
      lastName: row.patient_last_name,
      dateOfBirth: mapNullableDate(row.patient_date_of_birth),
      oib: row.patient_oib,
    },
    appointmentType: {
      id: bufferToUuid(row.appointment_type_id),
      name: row.appointment_type_name,
      defaultDurationMinutes: row.default_duration_minutes,
      isActive: Boolean(row.appointment_type_is_active),
    },
  };
};

export class AppointmentsRepository {
  public constructor(private readonly executor: DatabaseExecutor = db) {}

  public async findOrganization(
    organizationId: string,
  ): Promise<AppointmentOrganizationRecord | null> {
    const row = await this.executor<OrganizationRow>("organizations")
      .select("id", "timezone")
      .where({ id: uuidToBuffer(organizationId) })
      .first();

    return row ? mapOrganizationRecord(row) : null;
  }

  public async findDoctorInOrganization(
    organizationId: string,
    doctorUserId: string,
  ): Promise<AppointmentDoctorRecord | null> {
    const row = await this.executor<DoctorRow>(
      "organization_doctors as organizationDoctor",
    )
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "organizationDoctor.doctor_user_id",
      )
      .select(
        "doctor.user_id",
        "doctor.first_name",
        "doctor.last_name",
        "doctor.title",
        "organizationDoctor.is_active",
      )
      .where("organizationDoctor.organization_id", uuidToBuffer(organizationId))
      .andWhere("organizationDoctor.doctor_user_id", uuidToBuffer(doctorUserId))
      .first();

    return row ? mapDoctorRecord(row) : null;
  }

  public async findActiveDoctors(
    organizationId: string,
    doctorUserId?: string,
  ): Promise<AppointmentDoctorRecord[]> {
    const query = this.executor<DoctorRow>(
      "organization_doctors as organizationDoctor",
    )
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "organizationDoctor.doctor_user_id",
      )
      .select(
        "doctor.user_id",
        "doctor.first_name",
        "doctor.last_name",
        "doctor.title",
        "organizationDoctor.is_active",
      )
      .where("organizationDoctor.organization_id", uuidToBuffer(organizationId))
      .andWhere("organizationDoctor.is_active", 1);

    if (doctorUserId) {
      query.andWhere(
        "organizationDoctor.doctor_user_id",
        uuidToBuffer(doctorUserId),
      );
    }

    const rows = await query
      .orderBy("doctor.last_name", "asc")
      .orderBy("doctor.first_name", "asc")
      .orderBy("doctor.user_id", "asc");

    return rows.map(mapDoctorRecord);
  }

  public async findPatientInOrganization(
    organizationId: string,
    patientUserId: string,
  ): Promise<AppointmentPatientRecord | null> {
    const row = await this.executor<PatientRow>("patient_profiles as patient")
      .innerJoin(
        "organization_users as organizationUser",
        function joinPatient(this: Knex.JoinClause) {
          this.on("organizationUser.user_id", "=", "patient.user_id").andOnVal(
            "organizationUser.organization_id",
            "=",
            uuidToBuffer(organizationId),
          );
        },
      )
      .select(
        "patient.user_id",
        "patient.first_name",
        "patient.last_name",
        "patient.date_of_birth",
        "patient.oib",
      )
      .where("patient.user_id", uuidToBuffer(patientUserId))
      .andWhere("organizationUser.role", "PATIENT")
      .andWhere("organizationUser.is_active", 1)
      .first();

    return row ? mapPatientRecord(row) : null;
  }

  public async findAppointmentType(
    organizationId: string,
    appointmentTypeId: string,
  ): Promise<AppointmentTypeRecord | null> {
    const row = await this.executor<AppointmentTypeRow>("appointment_types")
      .select("id", "name", "default_duration_minutes", "is_active")
      .where("id", uuidToBuffer(appointmentTypeId))
      .andWhere("organization_id", uuidToBuffer(organizationId))
      .first();

    return row ? mapAppointmentTypeRecord(row) : null;
  }

  public async findWorkingHour(
    organizationId: string,
    doctorUserId: string,
    dayOfWeek: number,
  ): Promise<AppointmentWorkingHourRecord | null> {
    const row = await this.executor<AppointmentWorkingHourRow>(
      "doctor_working_hours",
    )
      .select(
        "id",
        "doctor_user_id",
        "day_of_week",
        "start_time",
        "end_time",
        "is_off",
      )
      .where("organization_id", uuidToBuffer(organizationId))
      .andWhere("doctor_user_id", uuidToBuffer(doctorUserId))
      .andWhere("day_of_week", dayOfWeek)
      .first();

    return row ? mapWorkingHourRecord(row) : null;
  }

  public async findWorkingHoursForDoctors(
    organizationId: string,
    doctorUserIds: readonly string[],
    dayOfWeek: number,
  ): Promise<AppointmentWorkingHourRecord[]> {
    if (doctorUserIds.length === 0) {
      return [];
    }

    const rows = await this.executor<AppointmentWorkingHourRow>(
      "doctor_working_hours",
    )
      .select(
        "id",
        "doctor_user_id",
        "day_of_week",
        "start_time",
        "end_time",
        "is_off",
      )
      .where("organization_id", uuidToBuffer(organizationId))
      .andWhere("day_of_week", dayOfWeek)
      .whereIn(
        "doctor_user_id",
        doctorUserIds.map((doctorUserId) => uuidToBuffer(doctorUserId)),
      )
      .orderBy("start_time", "asc");

    return rows.map(mapWorkingHourRecord);
  }

  public async findTimeOffOverlaps(
    organizationId: string,
    doctorUserId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentTimeOffRecord[]> {
    const rows = await this.executor<AppointmentTimeOffRow>("doctor_time_off")
      .select("id", "doctor_user_id", "start_at", "end_at")
      .where("organization_id", uuidToBuffer(organizationId))
      .andWhere("doctor_user_id", uuidToBuffer(doctorUserId))
      .andWhere("start_at", "<", endAt)
      .andWhere("end_at", ">", startAt)
      .orderBy("start_at", "asc");

    return rows.map(mapTimeOffRecord);
  }

  public async findTimeOffForDoctors(
    organizationId: string,
    doctorUserIds: readonly string[],
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentTimeOffRecord[]> {
    if (doctorUserIds.length === 0) {
      return [];
    }

    const rows = await this.executor<AppointmentTimeOffRow>("doctor_time_off")
      .select("id", "doctor_user_id", "start_at", "end_at")
      .where("organization_id", uuidToBuffer(organizationId))
      .whereIn(
        "doctor_user_id",
        doctorUserIds.map((doctorUserId) => uuidToBuffer(doctorUserId)),
      )
      .andWhere("start_at", "<", endAt)
      .andWhere("end_at", ">", startAt)
      .orderBy("start_at", "asc");

    return rows.map(mapTimeOffRecord);
  }

  public async findConflictingAppointments(
    input: FindConflictingAppointmentsInput,
  ): Promise<AppointmentConflictRecord[]> {
    const query = this.executor<AppointmentConflictRow>("appointments")
      .select("id", "doctor_user_id", "patient_user_id", "start_at", "end_at")
      .where("organization_id", uuidToBuffer(input.organizationId))
      .andWhere("status", "SCHEDULED")
      .andWhere((builder: Knex.QueryBuilder) => {
        builder
          .where("doctor_user_id", uuidToBuffer(input.doctorUserId))
          .orWhere("patient_user_id", uuidToBuffer(input.patientUserId));
      })
      .andWhere("start_at", "<", input.endAt)
      .andWhere("end_at", ">", input.startAt)
      .orderBy("start_at", "asc");

    if (input.excludeAppointmentId) {
      query.andWhereNot("id", uuidToBuffer(input.excludeAppointmentId));
    }

    if (input.lockForUpdate) {
      query.forUpdate();
    }

    const rows = await query;

    return rows.map(mapConflictRecord);
  }

  public async findAppointmentsForDoctors(
    organizationId: string,
    doctorUserIds: readonly string[],
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentConflictRecord[]> {
    if (doctorUserIds.length === 0) {
      return [];
    }

    const rows = await this.executor<AppointmentConflictRow>("appointments")
      .select("id", "doctor_user_id", "patient_user_id", "start_at", "end_at")
      .where("organization_id", uuidToBuffer(organizationId))
      .andWhere("status", "SCHEDULED")
      .whereIn(
        "doctor_user_id",
        doctorUserIds.map((doctorUserId) => uuidToBuffer(doctorUserId)),
      )
      .andWhere("start_at", "<", endAt)
      .andWhere("end_at", ">", startAt)
      .orderBy("start_at", "asc");

    return rows.map(mapConflictRecord);
  }

  public async lockDoctorSchedule(
    organizationId: string,
    doctorUserId: string,
  ): Promise<void> {
    await this.executor("organization_doctors")
      .select("id")
      .where("organization_id", uuidToBuffer(organizationId))
      .andWhere("doctor_user_id", uuidToBuffer(doctorUserId))
      .forUpdate()
      .first();
  }

  public async lockPatientSchedule(
    organizationId: string,
    patientUserId: string,
  ): Promise<void> {
    await this.executor("organization_users")
      .select("id")
      .where({
        organization_id: uuidToBuffer(organizationId),
        user_id: uuidToBuffer(patientUserId),
      })
      .where("role", "PATIENT")
      .forUpdate()
      .first();
  }

  public async findById(
    organizationId: string,
    appointmentId: string,
  ): Promise<AppointmentRecord | null> {
    const row = await this.baseAppointmentQuery()
      .where("appointment.organization_id", uuidToBuffer(organizationId))
      .andWhere("appointment.id", uuidToBuffer(appointmentId))
      .first();

    return row ? mapAppointmentRecord(row) : null;
  }

  public async findMany(
    input: FindAppointmentsInput,
  ): Promise<AppointmentRecord[]> {
    const query = this.baseAppointmentQuery().where(
      "appointment.organization_id",
      uuidToBuffer(input.organizationId),
    );

    if (input.startAt) {
      query.andWhere("appointment.start_at", ">=", input.startAt);
    }

    if (input.endAt) {
      query.andWhere("appointment.start_at", "<", input.endAt);
    }

    if (input.doctorUserId) {
      query.andWhere(
        "appointment.doctor_user_id",
        uuidToBuffer(input.doctorUserId),
      );
    }

    if (input.patientUserId) {
      query.andWhere(
        "appointment.patient_user_id",
        uuidToBuffer(input.patientUserId),
      );
    }

    if (input.status) {
      query.andWhere("appointment.status", input.status);
    }

    const rows = await query
      .orderBy("appointment.start_at", "asc")
      .orderBy("appointment.id", "asc")
      .limit(input.limit);

    return rows.map(mapAppointmentRecord);
  }

  public async createAppointment(
    input: CreateAppointmentInput,
  ): Promise<AppointmentRecord> {
    const id = uuidv4();

    await this.executor("appointments").insert({
      id: uuidToBuffer(id),
      organization_id: uuidToBuffer(input.organizationId),
      doctor_user_id: uuidToBuffer(input.doctorUserId),
      patient_user_id: uuidToBuffer(input.patientUserId),
      appointment_type_id: uuidToBuffer(input.appointmentTypeId),
      start_at: input.startAt,
      end_at: input.endAt,
      status: "SCHEDULED",
      created_by_org_user_id: uuidToBuffer(input.createdByOrgUserId),
      notes: input.notes,
    });

    const appointment = await this.findById(input.organizationId, id);

    if (!appointment) {
      throw new Error("Appointment creation failed.");
    }

    return appointment;
  }

  public async updateSchedule(
    organizationId: string,
    appointmentId: string,
    input: UpdateAppointmentScheduleInput,
  ): Promise<AppointmentRecord | null> {
    const updateValues: Record<string, unknown> = {
      updated_by_org_user_id: uuidToBuffer(input.updatedByOrgUserId),
    };

    if (input.doctorUserId !== undefined) {
      updateValues.doctor_user_id = uuidToBuffer(input.doctorUserId);
    }

    if (input.appointmentTypeId !== undefined) {
      updateValues.appointment_type_id = uuidToBuffer(input.appointmentTypeId);
    }

    if (input.startAt !== undefined) {
      updateValues.start_at = input.startAt;
    }

    if (input.endAt !== undefined) {
      updateValues.end_at = input.endAt;
    }

    if ("notes" in input) {
      updateValues.notes = input.notes;
    }

    const affectedRows = await this.executor("appointments")
      .where({
        id: uuidToBuffer(appointmentId),
        organization_id: uuidToBuffer(organizationId),
      })
      .update(updateValues);

    if (affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId, appointmentId);
  }

  public async cancelAppointment(
    organizationId: string,
    appointmentId: string,
    input: CancelAppointmentInput,
  ): Promise<AppointmentRecord | null> {
    const affectedRows = await this.executor("appointments")
      .where({
        id: uuidToBuffer(appointmentId),
        organization_id: uuidToBuffer(organizationId),
      })
      .update({
        status: "CANCELLED",
        cancellation_reason: input.cancellationReason,
        updated_by_org_user_id: uuidToBuffer(input.updatedByOrgUserId),
      });

    if (affectedRows === 0) {
      return null;
    }

    return this.findById(organizationId, appointmentId);
  }

  private baseAppointmentQuery() {
    return this.executor<AppointmentRow>("appointments as appointment")
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "appointment.doctor_user_id",
      )
      .innerJoin(
        "organization_doctors as organizationDoctor",
        function joinOrganizationDoctor(this: Knex.JoinClause) {
          this.on(
            "organizationDoctor.organization_id",
            "=",
            "appointment.organization_id",
          ).andOn(
            "organizationDoctor.doctor_user_id",
            "=",
            "appointment.doctor_user_id",
          );
        },
      )
      .innerJoin(
        "patient_profiles as patient",
        "patient.user_id",
        "appointment.patient_user_id",
      )
      .innerJoin(
        "appointment_types as appointmentType",
        "appointmentType.id",
        "appointment.appointment_type_id",
      )
      .select(...APPOINTMENT_COLUMNS);
  }
}
