import type {
  NotificationChannelDto,
  NotificationDto,
  NotificationListQueryDto,
  NotificationStatusDto,
  NotificationSummaryDto,
} from '@zdravstvo/contracts';
import type { Buffer } from 'node:buffer';

import { db } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';

const PAGE_SIZE = 10;

interface NotificationRow {
  reminder_id: Buffer | Uint8Array | string;
  appointment_id: Buffer | Uint8Array | string;
  channel: NotificationChannelDto;
  scheduled_for: Date | string;
  sent_at: Date | string | null;
  status: NotificationStatusDto;
  attempt_count: number;
  last_error: string | null;
  appointment_start_at: Date | string;
  appointment_end_at: Date | string;
  patient_first_name: string;
  patient_last_name: string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_title: string | null;
  appointment_type_name: string;
}

interface CountRow {
  total: string | number | bigint;
}

interface StatusCountRow {
  status: NotificationStatusDto;
  total: string | number | bigint;
}

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const toNullableDate = (value: Date | string | null): Date | null =>
  value === null ? null : toDate(value);

const toDto = (row: NotificationRow): NotificationDto => ({
  id: bufferToUuid(row.reminder_id),
  appointmentId: bufferToUuid(row.appointment_id),
  channel: row.channel,
  scheduledFor: toDate(row.scheduled_for).toISOString(),
  sentAt: toNullableDate(row.sent_at)?.toISOString() ?? null,
  status: row.status,
  attemptCount: row.attempt_count,
  lastError: row.last_error,
  appointment: {
    id: bufferToUuid(row.appointment_id),
    startAt: toDate(row.appointment_start_at).toISOString(),
    endAt: toDate(row.appointment_end_at).toISOString(),
    patientFirstName: row.patient_first_name,
    patientLastName: row.patient_last_name,
    doctorFirstName: row.doctor_first_name,
    doctorLastName: row.doctor_last_name,
    doctorTitle: row.doctor_title,
    appointmentTypeName: row.appointment_type_name,
  },
});

const buildBaseQuery = (organizationId: string, query: NotificationListQueryDto) => {
  let q = db<NotificationRow>('appointment_reminders as reminder')
    .innerJoin('appointments as appointment', 'appointment.id', 'reminder.appointment_id')
    .innerJoin('patient_profiles as patient', 'patient.user_id', 'appointment.patient_user_id')
    .innerJoin('doctor_profiles as doctor', 'doctor.user_id', 'appointment.doctor_user_id')
    .innerJoin('appointment_types as apptType', 'apptType.id', 'appointment.appointment_type_id')
    .where('reminder.organization_id', uuidToBuffer(organizationId));

  if (query.status) {
    q = q.andWhere('reminder.status', query.status);
  }

  if (query.channel) {
    q = q.andWhere('reminder.channel', query.channel);
  }

  if (query.dateFrom) {
    q = q.andWhere('reminder.scheduled_for', '>=', new Date(`${query.dateFrom}T00:00:00.000Z`));
  }

  if (query.dateTo) {
    q = q.andWhere('reminder.scheduled_for', '<', new Date(`${query.dateTo}T23:59:59.999Z`));
  }

  return q;
};

export const notificationsRepository = {
  async find(
    organizationId: string,
    query: NotificationListQueryDto,
  ): Promise<NotificationDto[]> {
    const page = query.page ?? 1;
    const offset = (page - 1) * PAGE_SIZE;

    const rows = await buildBaseQuery(organizationId, query)
      .select(
        'reminder.id as reminder_id',
        'reminder.appointment_id',
        'reminder.channel',
        'reminder.scheduled_for',
        'reminder.sent_at',
        'reminder.status',
        'reminder.attempt_count',
        'reminder.last_error',
        'appointment.start_at as appointment_start_at',
        'appointment.end_at as appointment_end_at',
        'patient.first_name as patient_first_name',
        'patient.last_name as patient_last_name',
        'doctor.first_name as doctor_first_name',
        'doctor.last_name as doctor_last_name',
        'doctor.title as doctor_title',
        'apptType.name as appointment_type_name',
      )
      .orderBy('reminder.scheduled_for', 'desc')
      .orderBy('reminder.id', 'desc')
      .limit(PAGE_SIZE)
      .offset(offset);

    return rows.map(toDto);
  },

  async count(
    organizationId: string,
    query: NotificationListQueryDto,
  ): Promise<number> {
    const row = await buildBaseQuery(organizationId, query)
      .count<CountRow[]>({ total: 'reminder.id' })
      .first();

    return row ? Number(row.total) : 0;
  },

  async summarize(organizationId: string): Promise<NotificationSummaryDto> {
    const rows = await db<StatusCountRow>('appointment_reminders')
      .select('status')
      .count<StatusCountRow[]>({ total: 'id' })
      .where('organization_id', uuidToBuffer(organizationId))
      .groupBy('status');

    const counts = {
      PENDING: 0,
      SENT: 0,
      FAILED: 0,
      ...Object.fromEntries(rows.map((r) => [r.status, Number(r.total)])),
    };

    return {
      total: counts.PENDING + counts.SENT + counts.FAILED,
      pending: counts.PENDING,
      sent: counts.SENT,
      failed: counts.FAILED,
    };
  },
};
