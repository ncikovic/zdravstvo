import { OrganizationUserRole } from '@zdravstvo/contracts'
import type {
  ApiResponse,
  AdminReceptionDashboardDto,
  DashboardActivityDto,
  DashboardAppointmentDto,
  DashboardDoctorDto,
  DashboardFreeSlotDto,
  DashboardPatientDto,
  DashboardReminderDto,
  DashboardReminderSummaryDto,
  DashboardResponseDto,
  DoctorDashboardDto,
  PatientDashboardDto,
} from '@zdravstvo/contracts'

import { apiClient } from '@/services/api'
import type {
  DashboardActivity,
  DashboardAppointment,
  DashboardData,
  DashboardDoctor,
  DashboardFreeSlot,
  DashboardPatient,
  DashboardReminder,
  DashboardReminderSummary,
} from '@/types'

const mapDate = (value: string): Date => new Date(value)

const mapNullableDate = (value: string | null): Date | null =>
  value ? mapDate(value) : null

const mapDoctor = (doctor: DashboardDoctorDto): DashboardDoctor => ({
  id: doctor.id,
  firstName: doctor.firstName,
  lastName: doctor.lastName,
  title: doctor.title,
})

const mapPatient = (patient: DashboardPatientDto): DashboardPatient => ({
  id: patient.id,
  firstName: patient.firstName,
  lastName: patient.lastName,
  dateOfBirth: mapNullableDate(patient.dateOfBirth),
  oib: patient.oib,
})

const mapAppointment = (
  appointment: DashboardAppointmentDto,
): DashboardAppointment => ({
  id: appointment.id,
  startAt: mapDate(appointment.startAt),
  endAt: mapDate(appointment.endAt),
  status: appointment.status,
  notes: appointment.notes,
  cancellationReason: appointment.cancellationReason,
  doctor: mapDoctor(appointment.doctor),
  patient: mapPatient(appointment.patient),
  appointmentType: {
    id: appointment.appointmentType.id,
    name: appointment.appointmentType.name,
    defaultDurationMinutes:
      appointment.appointmentType.defaultDurationMinutes,
  },
})

const mapReminderSummary = (
  reminderSummary: DashboardReminderSummaryDto,
): DashboardReminderSummary => ({
  total: reminderSummary.total,
  pending: reminderSummary.pending,
  sent: reminderSummary.sent,
  failed: reminderSummary.failed,
})

const mapReminder = (reminder: DashboardReminderDto): DashboardReminder => ({
  id: reminder.id,
  appointmentId: reminder.appointmentId,
  channel: reminder.channel,
  scheduledFor: mapDate(reminder.scheduledFor),
  sentAt: mapNullableDate(reminder.sentAt),
  status: reminder.status,
  appointment: mapAppointment(reminder.appointment),
})

const mapActivity = (activity: DashboardActivityDto): DashboardActivity => ({
  id: activity.id,
  entityType: activity.entityType,
  action: activity.action,
  createdAt: mapDate(activity.createdAt),
})

const mapFreeSlot = (slot: DashboardFreeSlotDto): DashboardFreeSlot => ({
  doctorId: slot.doctorId,
  doctorName: slot.doctorName,
  doctorTitle: slot.doctorTitle,
  startAt: mapDate(slot.startAt),
  endAt: mapDate(slot.endAt),
  durationMinutes: slot.durationMinutes,
})

const isAdminReceptionDashboard = (
  dashboard: DashboardResponseDto,
): dashboard is AdminReceptionDashboardDto =>
  dashboard.role === OrganizationUserRole.ADMIN ||
  dashboard.role === OrganizationUserRole.RECEPTION

const isDoctorDashboard = (
  dashboard: DashboardResponseDto,
): dashboard is DoctorDashboardDto =>
  dashboard.role === OrganizationUserRole.DOCTOR

const isPatientDashboard = (
  dashboard: DashboardResponseDto,
): dashboard is PatientDashboardDto =>
  dashboard.role === OrganizationUserRole.PATIENT

const mapDashboard = (dashboard: DashboardResponseDto): DashboardData => {
  const base = {
    generatedAt: mapDate(dashboard.generatedAt),
    todayStart: mapDate(dashboard.todayStart),
    todayEnd: mapDate(dashboard.todayEnd),
    organization: {
      id: dashboard.organization.id,
      name: dashboard.organization.name,
      address: dashboard.organization.address,
      city: dashboard.organization.city,
    },
  }

  if (isAdminReceptionDashboard(dashboard)) {
    return {
      ...base,
      role: dashboard.role,
      stats: dashboard.stats,
      reminderSummary: mapReminderSummary(dashboard.reminderSummary),
      todaySchedule: dashboard.todaySchedule.map(mapAppointment),
      availableSlots: dashboard.availableSlots.map(mapFreeSlot),
      recentActivity: dashboard.recentActivity.map(mapActivity),
    }
  }

  if (isDoctorDashboard(dashboard)) {
    return {
      ...base,
      role: dashboard.role,
      stats: dashboard.stats,
      todaySchedule: dashboard.todaySchedule.map(mapAppointment),
      nextAppointment: dashboard.nextAppointment
        ? mapAppointment(dashboard.nextAppointment)
        : null,
      availableSlots: dashboard.availableSlots.map(mapFreeSlot),
      recentActivity: dashboard.recentActivity.map(mapActivity),
    }
  }

  if (isPatientDashboard(dashboard)) {
    return {
      ...base,
      role: dashboard.role,
      stats: dashboard.stats,
      nextAppointment: dashboard.nextAppointment
        ? mapAppointment(dashboard.nextAppointment)
        : null,
      upcomingAppointments: dashboard.upcomingAppointments.map(mapAppointment),
      reminders: dashboard.reminders.map(mapReminder),
      reminderSummary: mapReminderSummary(dashboard.reminderSummary),
    }
  }

  throw new Error('Unsupported dashboard role.')
}

export class DashboardService {
  public async getCurrent(): Promise<DashboardData> {
    const response =
      await apiClient.get<ApiResponse<DashboardResponseDto>>('/dashboard')

    return mapDashboard(response.data.data)
  }
}

export const dashboardService = new DashboardService()
