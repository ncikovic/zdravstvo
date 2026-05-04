import { z } from 'zod';

import type { OrganizationUserRole } from '../../enums/index.js';

export const dashboardQuerySchema = z.object({
  date: z.iso.date().optional(),
});

export type DashboardQueryDto = z.infer<typeof dashboardQuerySchema>;

export type DashboardAppointmentStatusDto =
  | 'SCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type DashboardReminderChannelDto = 'EMAIL' | 'SMS';

export type DashboardReminderStatusDto = 'PENDING' | 'SENT' | 'FAILED';

export type DashboardActivityEntityTypeDto =
  | 'APPOINTMENT'
  | 'TYPE'
  | 'DOCTOR'
  | 'ORG_SETTINGS'
  | 'PATIENT';

export type DashboardActivityActionDto =
  | 'CREATE'
  | 'UPDATE'
  | 'CANCEL'
  | 'STATUS_CHANGE';

export interface DashboardPersonDto {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DashboardDoctorDto extends DashboardPersonDto {
  title: string | null;
}

export interface DashboardPatientDto extends DashboardPersonDto {
  dateOfBirth: string | null;
  oib: string | null;
}

export interface DashboardAppointmentTypeDto {
  id: string;
  name: string;
  defaultDurationMinutes: number;
}

export interface DashboardAppointmentDto {
  id: string;
  startAt: string;
  endAt: string;
  status: DashboardAppointmentStatusDto;
  notes: string | null;
  cancellationReason: string | null;
  doctor: DashboardDoctorDto;
  patient: DashboardPatientDto;
  appointmentType: DashboardAppointmentTypeDto;
}

export interface DashboardReminderSummaryDto {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

export interface DashboardReminderDto {
  id: string;
  appointmentId: string;
  channel: DashboardReminderChannelDto;
  scheduledFor: string;
  sentAt: string | null;
  status: DashboardReminderStatusDto;
  appointment: DashboardAppointmentDto;
}

export interface DashboardActivityDto {
  id: string;
  entityType: DashboardActivityEntityTypeDto;
  action: DashboardActivityActionDto;
  createdAt: string;
}

export interface DashboardFreeSlotDto {
  doctorId: string;
  doctorName: string;
  doctorTitle: string | null;
  startAt: string;
  endAt: string;
  durationMinutes: number;
}

export interface DashboardOrganizationDto {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
}

export interface AdminReceptionDashboardStatsDto {
  todayAppointmentCount: number;
  activeDoctorCount: number;
  recentPatientCount: number;
  reminderCount: number;
  completedAppointmentCount: number;
  scheduledAppointmentCount: number;
  cancelledAppointmentCount: number;
  sentReminderCount: number;
}

export interface DoctorDashboardStatsDto {
  todayAppointmentCount: number;
  patientsTodayCount: number;
  freeBlockCount: number;
  completedAppointmentCount: number;
}

export interface PatientDashboardStatsDto {
  confirmedFutureAppointmentCount: number;
  reminderCount: number;
}

export interface DashboardBaseDto {
  generatedAt: string;
  todayStart: string;
  todayEnd: string;
  organization: DashboardOrganizationDto;
}

export interface AdminReceptionDashboardDto extends DashboardBaseDto {
  role: OrganizationUserRole.ADMIN | OrganizationUserRole.RECEPTION;
  stats: AdminReceptionDashboardStatsDto;
  reminderSummary: DashboardReminderSummaryDto;
  todaySchedule: DashboardAppointmentDto[];
  availableSlots: DashboardFreeSlotDto[];
  recentActivity: DashboardActivityDto[];
}

export interface DoctorDashboardDto extends DashboardBaseDto {
  role: OrganizationUserRole.DOCTOR;
  stats: DoctorDashboardStatsDto;
  todaySchedule: DashboardAppointmentDto[];
  nextAppointment: DashboardAppointmentDto | null;
  availableSlots: DashboardFreeSlotDto[];
  recentActivity: DashboardActivityDto[];
}

export interface PatientDashboardDto extends DashboardBaseDto {
  role: OrganizationUserRole.PATIENT;
  stats: PatientDashboardStatsDto;
  nextAppointment: DashboardAppointmentDto | null;
  upcomingAppointments: DashboardAppointmentDto[];
  reminders: DashboardReminderDto[];
  reminderSummary: DashboardReminderSummaryDto;
}

export type DashboardResponseDto =
  | AdminReceptionDashboardDto
  | DoctorDashboardDto
  | PatientDashboardDto;
