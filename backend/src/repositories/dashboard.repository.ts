import type {
  DashboardActivityActionDto,
  DashboardActivityEntityTypeDto,
  DashboardAppointmentStatusDto,
  DashboardReminderChannelDto,
  DashboardReminderStatusDto,
} from "@zdravstvo/contracts";
import type { Buffer } from "node:buffer";

import type { DatabaseExecutor } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";

export interface DashboardDoctorRecord {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  isActive: boolean;
}

export interface DashboardPatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  oib: string | null;
}

export interface DashboardAppointmentTypeRecord {
  id: string;
  name: string;
  defaultDurationMinutes: number;
}

export interface DashboardAppointmentRecord {
  id: string;
  organizationId: string;
  startAt: Date;
  endAt: Date;
  status: DashboardAppointmentStatusDto;
  notes: string | null;
  cancellationReason: string | null;
  doctor: DashboardDoctorRecord;
  patient: DashboardPatientRecord;
  appointmentType: DashboardAppointmentTypeRecord;
}

export interface DashboardReminderSummaryRecord {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

export interface DashboardReminderRecord {
  id: string;
  appointmentId: string;
  channel: DashboardReminderChannelDto;
  scheduledFor: Date;
  sentAt: Date | null;
  status: DashboardReminderStatusDto;
  appointment: DashboardAppointmentRecord;
}

export interface DashboardActivityRecord {
  id: string;
  entityType: DashboardActivityEntityTypeDto;
  action: DashboardActivityActionDto;
  createdAt: Date;
}

export interface DashboardWorkingHourRecord {
  id: string;
  doctorUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface DashboardTimeOffRecord {
  id: string;
  doctorUserId: string;
  startAt: Date;
  endAt: Date;
}

export interface DashboardOrganizationRecord {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  timezone: string;
}

export interface FindDashboardAppointmentsInput {
  organizationId: string;
  startAt: Date;
  endAt: Date;
  doctorUserId?: string;
  patientUserId?: string;
  doctorUserIds?: readonly string[];
  statuses?: readonly DashboardAppointmentStatusDto[];
  limit?: number;
}

export interface FindDashboardRemindersInput {
  organizationId: string;
  startAt: Date;
  endAt: Date;
  doctorUserId?: string;
  patientUserId?: string;
  limit?: number;
}

export interface FindDashboardActivitiesInput {
  organizationId: string;
  doctorUserId?: string;
  limit: number;
}

interface CountRow {
  total: string | number | bigint;
}

interface StatusCountRow {
  status: DashboardAppointmentStatusDto | DashboardReminderStatusDto;
  total: string | number | bigint;
}

interface DashboardOrganizationRow {
  id: Buffer | Uint8Array | string;
  name: string;
  address: string | null;
  city: string | null;
  timezone: string;
}

interface DashboardDoctorRow {
  user_id: Buffer | Uint8Array | string;
  first_name: string;
  last_name: string;
  title: string | null;
  is_active: number | boolean;
}

interface DashboardAppointmentRow {
  id: Buffer | Uint8Array | string;
  organization_id: Buffer | Uint8Array | string;
  start_at: Date | string;
  end_at: Date | string;
  status: DashboardAppointmentStatusDto;
  notes: string | null;
  cancellation_reason: string | null;
  doctor_user_id: Buffer | Uint8Array | string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_title: string | null;
  doctor_is_active: number | boolean;
  patient_user_id: Buffer | Uint8Array | string;
  patient_first_name: string;
  patient_last_name: string;
  patient_date_of_birth: Date | string | null;
  patient_oib: string | null;
  appointment_type_id: Buffer | Uint8Array | string;
  appointment_type_name: string;
  default_duration_minutes: number;
}

interface DashboardReminderRow extends DashboardAppointmentRow {
  reminder_id: Buffer | Uint8Array | string;
  appointment_id: Buffer | Uint8Array | string;
  channel: DashboardReminderChannelDto;
  scheduled_for: Date | string;
  sent_at: Date | string | null;
  reminder_status: DashboardReminderStatusDto;
}

interface DashboardActivityRow {
  id: Buffer | Uint8Array | string;
  entity_type: DashboardActivityEntityTypeDto;
  action: DashboardActivityActionDto;
  created_at: Date | string;
}

interface DashboardWorkingHourRow {
  id: Buffer | Uint8Array | string;
  doctor_user_id: Buffer | Uint8Array | string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_off: number | boolean;
}

interface DashboardTimeOffRow {
  id: Buffer | Uint8Array | string;
  doctor_user_id: Buffer | Uint8Array | string;
  start_at: Date | string;
  end_at: Date | string;
}

const APPOINTMENT_COLUMNS = [
  "appointment.id as id",
  "appointment.organization_id as organization_id",
  "appointment.start_at as start_at",
  "appointment.end_at as end_at",
  "appointment.status as status",
  "appointment.notes as notes",
  "appointment.cancellation_reason as cancellation_reason",
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
] as const;

const mapDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

const mapNullableDate = (value: Date | string | null): Date | null => {
  return value === null ? null : mapDate(value);
};

const mapCount = (row: CountRow | undefined): number => {
  if (!row) {
    return 0;
  }

  return Number(row.total);
};

const mapAppointmentRecord = (
  row: DashboardAppointmentRow,
): DashboardAppointmentRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    startAt: mapDate(row.start_at),
    endAt: mapDate(row.end_at),
    status: row.status,
    notes: row.notes,
    cancellationReason: row.cancellation_reason,
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
    },
  };
};

const mapReminderRecord = (
  row: DashboardReminderRow,
): DashboardReminderRecord => {
  return {
    id: bufferToUuid(row.reminder_id),
    appointmentId: bufferToUuid(row.appointment_id),
    channel: row.channel,
    scheduledFor: mapDate(row.scheduled_for),
    sentAt: mapNullableDate(row.sent_at),
    status: row.reminder_status,
    appointment: mapAppointmentRecord(row),
  };
};

const mapActivityRecord = (
  row: DashboardActivityRow,
): DashboardActivityRecord => {
  return {
    id: bufferToUuid(row.id),
    entityType: row.entity_type,
    action: row.action,
    createdAt: mapDate(row.created_at),
  };
};

const mapWorkingHourRecord = (
  row: DashboardWorkingHourRow,
): DashboardWorkingHourRecord => {
  return {
    id: bufferToUuid(row.id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    isOff: Boolean(row.is_off),
  };
};

const mapTimeOffRecord = (row: DashboardTimeOffRow): DashboardTimeOffRecord => {
  return {
    id: bufferToUuid(row.id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    startAt: mapDate(row.start_at),
    endAt: mapDate(row.end_at),
  };
};

export class DashboardRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findOrganization(
    organizationId: string,
  ): Promise<DashboardOrganizationRecord | null> {
    const row = await this.executor<DashboardOrganizationRow>("organizations")
      .select("id", "name", "address", "city", "timezone")
      .where({ id: uuidToBuffer(organizationId) })
      .first();

    return row
      ? {
          id: bufferToUuid(row.id),
          name: row.name,
          address: row.address,
          city: row.city,
          timezone: row.timezone,
        }
      : null;
  }

  public async findActiveDoctors(
    organizationId: string,
  ): Promise<DashboardDoctorRecord[]> {
    const rows = await this.executor<DashboardDoctorRow>(
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
      .andWhere("organizationDoctor.is_active", 1)
      .orderBy("doctor.last_name", "asc")
      .orderBy("doctor.first_name", "asc");

    return rows.map((row) => ({
      id: bufferToUuid(row.user_id),
      firstName: row.first_name,
      lastName: row.last_name,
      title: row.title,
      isActive: Boolean(row.is_active),
    }));
  }

  public async countActiveDoctors(organizationId: string): Promise<number> {
    const row = await this.executor("organization_doctors")
      .where({
        organization_id: uuidToBuffer(organizationId),
        is_active: 1,
      })
      .count<CountRow[]>({ total: "*" })
      .first();

    return mapCount(row);
  }

  public async countRecentPatients(
    organizationId: string,
    since: Date,
  ): Promise<number> {
    const row = await this.executor("organization_users")
      .where({
        organization_id: uuidToBuffer(organizationId),
        role: "PATIENT",
        is_active: 1,
      })
      .andWhere("created_at", ">=", since)
      .count<CountRow[]>({ total: "*" })
      .first();

    return mapCount(row);
  }

  public async countAppointments(
    input: FindDashboardAppointmentsInput,
  ): Promise<number> {
    const query = this.buildAppointmentQuery(input);
    const row = await query.count<CountRow[]>({ total: "*" }).first();

    return mapCount(row);
  }

  public async countDistinctPatients(
    input: FindDashboardAppointmentsInput,
  ): Promise<number> {
    const query = this.buildAppointmentQuery(input);
    const row = await query
      .countDistinct<CountRow[]>({ total: "appointment.patient_user_id" })
      .first();

    return mapCount(row);
  }

  public async countAppointmentsByStatus(
    input: FindDashboardAppointmentsInput,
  ): Promise<Record<DashboardAppointmentStatusDto, number>> {
    const rows = await this.buildAppointmentQuery(input)
      .select("appointment.status as status")
      .count<StatusCountRow[]>({ total: "*" })
      .groupBy("appointment.status");

    return {
      SCHEDULED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
      NO_SHOW: 0,
      ...Object.fromEntries(
        rows.map((row) => [row.status, Number(row.total)]),
      ),
    };
  }

  public async findAppointments(
    input: FindDashboardAppointmentsInput,
  ): Promise<DashboardAppointmentRecord[]> {
    let query = this.buildAppointmentQuery(input)
      .select(...APPOINTMENT_COLUMNS)
      .orderBy("appointment.start_at", "asc")
      .orderBy("appointment.id", "asc");

    if (input.limit !== undefined) {
      query = query.limit(input.limit);
    }

    const rows = await query;

    return rows.map(mapAppointmentRecord);
  }

  public async countReminders(
    input: FindDashboardRemindersInput,
  ): Promise<DashboardReminderSummaryRecord> {
    const rows = await this.buildReminderQuery(input)
      .select("reminder.status as status")
      .count<StatusCountRow[]>({ total: "*" })
      .groupBy("reminder.status");
    const counts = {
      PENDING: 0,
      SENT: 0,
      FAILED: 0,
      ...Object.fromEntries(
        rows.map((row) => [row.status, Number(row.total)]),
      ),
    };

    return {
      total: counts.PENDING + counts.SENT + counts.FAILED,
      pending: counts.PENDING,
      sent: counts.SENT,
      failed: counts.FAILED,
    };
  }

  public async findReminders(
    input: FindDashboardRemindersInput,
  ): Promise<DashboardReminderRecord[]> {
    let query = this.buildReminderQuery(input)
      .select(
        "reminder.id as reminder_id",
        "reminder.appointment_id as appointment_id",
        "reminder.channel as channel",
        "reminder.scheduled_for as scheduled_for",
        "reminder.sent_at as sent_at",
        "reminder.status as reminder_status",
        ...APPOINTMENT_COLUMNS,
      )
      .orderBy("reminder.scheduled_for", "asc")
      .orderBy("reminder.id", "asc");

    if (input.limit !== undefined) {
      query = query.limit(input.limit);
    }

    const rows = await query;

    return rows.map(mapReminderRecord);
  }

  public async findRecentActivities(
    input: FindDashboardActivitiesInput,
  ): Promise<DashboardActivityRecord[]> {
    let query = this.executor<DashboardActivityRow>(
      "activity_log as activity",
    )
      .leftJoin("appointments as appointment", "appointment.id", "activity.entity_id")
      .select(
        "activity.id",
        "activity.entity_type",
        "activity.action",
        "activity.created_at",
      )
      .where("activity.organization_id", uuidToBuffer(input.organizationId))
      .orderBy("activity.created_at", "desc")
      .orderBy("activity.id", "desc")
      .limit(input.limit);

    if (input.doctorUserId) {
      query = query.andWhere(
        "appointment.doctor_user_id",
        uuidToBuffer(input.doctorUserId),
      );
    }

    const rows = await query;

    return rows.map(mapActivityRecord);
  }

  public async findWorkingHoursForDoctors(
    organizationId: string,
    doctorUserIds: readonly string[],
    dayOfWeek: number,
  ): Promise<DashboardWorkingHourRecord[]> {
    if (doctorUserIds.length === 0) {
      return [];
    }

    const rows = await this.executor<DashboardWorkingHourRow>(
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
      );

    return rows.map(mapWorkingHourRecord);
  }

  public async findTimeOffForDoctors(
    organizationId: string,
    doctorUserIds: readonly string[],
    startAt: Date,
    endAt: Date,
  ): Promise<DashboardTimeOffRecord[]> {
    if (doctorUserIds.length === 0) {
      return [];
    }

    const rows = await this.executor<DashboardTimeOffRow>("doctor_time_off")
      .select("id", "doctor_user_id", "start_at", "end_at")
      .where("organization_id", uuidToBuffer(organizationId))
      .whereIn(
        "doctor_user_id",
        doctorUserIds.map((doctorUserId) => uuidToBuffer(doctorUserId)),
      )
      .andWhere("start_at", "<", endAt)
      .andWhere("end_at", ">", startAt);

    return rows.map(mapTimeOffRecord);
  }

  private buildAppointmentQuery(input: FindDashboardAppointmentsInput) {
    const query = this.executor<DashboardAppointmentRow>(
      "appointments as appointment",
    )
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "appointment.doctor_user_id",
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
      .leftJoin(
        "organization_doctors as organizationDoctor",
        "organizationDoctor.doctor_user_id",
        "appointment.doctor_user_id",
      )
      .where("appointment.organization_id", uuidToBuffer(input.organizationId))
      .andWhere("appointment.start_at", ">=", input.startAt)
      .andWhere("appointment.start_at", "<", input.endAt)
      .andWhere(
        "organizationDoctor.organization_id",
        uuidToBuffer(input.organizationId),
      );

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

    if (input.doctorUserIds) {
      query.whereIn(
        "appointment.doctor_user_id",
        input.doctorUserIds.map((doctorUserId) => uuidToBuffer(doctorUserId)),
      );
    }

    if (input.statuses) {
      query.whereIn("appointment.status", input.statuses);
    }

    return query;
  }

  private buildReminderQuery(input: FindDashboardRemindersInput) {
    const query = this.executor<DashboardReminderRow>(
      "appointment_reminders as reminder",
    )
      .innerJoin(
        "appointments as appointment",
        "appointment.id",
        "reminder.appointment_id",
      )
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "appointment.doctor_user_id",
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
      .leftJoin(
        "organization_doctors as organizationDoctor",
        "organizationDoctor.doctor_user_id",
        "appointment.doctor_user_id",
      )
      .where("reminder.organization_id", uuidToBuffer(input.organizationId))
      .andWhere("reminder.scheduled_for", ">=", input.startAt)
      .andWhere("reminder.scheduled_for", "<", input.endAt)
      .andWhere(
        "organizationDoctor.organization_id",
        uuidToBuffer(input.organizationId),
      );

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

    return query;
  }
}
