import type {
  DashboardActivityActionDto,
  DashboardActivityEntityTypeDto,
  DashboardAppointmentStatusDto,
  DashboardReminderChannelDto,
  DashboardReminderStatusDto,
  OrganizationUserRole,
} from '@zdravstvo/contracts'

export interface DashboardPerson {
  id: string
  firstName: string
  lastName: string
}

export interface DashboardDoctor extends DashboardPerson {
  title: string | null
}

export interface DashboardPatient extends DashboardPerson {
  dateOfBirth: Date | null
  oib: string | null
}

export interface DashboardAppointmentType {
  id: string
  name: string
  defaultDurationMinutes: number
}

export interface DashboardAppointment {
  id: string
  startAt: Date
  endAt: Date
  status: DashboardAppointmentStatusDto
  notes: string | null
  cancellationReason: string | null
  doctor: DashboardDoctor
  patient: DashboardPatient
  appointmentType: DashboardAppointmentType
}

export interface DashboardReminderSummary {
  total: number
  pending: number
  sent: number
  failed: number
}

export interface DashboardReminder {
  id: string
  appointmentId: string
  channel: DashboardReminderChannelDto
  scheduledFor: Date
  sentAt: Date | null
  status: DashboardReminderStatusDto
  appointment: DashboardAppointment
}

export interface DashboardActivity {
  id: string
  entityType: DashboardActivityEntityTypeDto
  action: DashboardActivityActionDto
  createdAt: Date
}

export interface DashboardFreeSlot {
  doctorId: string
  doctorName: string
  doctorTitle: string | null
  startAt: Date
  endAt: Date
  durationMinutes: number
}

export interface DashboardOrganization {
  id: string
  name: string
  address: string | null
  city: string | null
}

export interface AdminReceptionDashboardStats {
  todayAppointmentCount: number
  activeDoctorCount: number
  recentPatientCount: number
  reminderCount: number
  completedAppointmentCount: number
  scheduledAppointmentCount: number
  cancelledAppointmentCount: number
  sentReminderCount: number
}

export interface DoctorDashboardStats {
  todayAppointmentCount: number
  patientsTodayCount: number
  freeBlockCount: number
  completedAppointmentCount: number
}

export interface PatientDashboardStats {
  confirmedFutureAppointmentCount: number
  reminderCount: number
}

export interface DashboardBase {
  generatedAt: Date
  todayStart: Date
  todayEnd: Date
  organization: DashboardOrganization
}

export interface AdminReceptionDashboard extends DashboardBase {
  role: OrganizationUserRole.ADMIN | OrganizationUserRole.RECEPTION
  stats: AdminReceptionDashboardStats
  reminderSummary: DashboardReminderSummary
  todaySchedule: DashboardAppointment[]
  availableSlots: DashboardFreeSlot[]
  recentActivity: DashboardActivity[]
}

export interface DoctorDashboard extends DashboardBase {
  role: OrganizationUserRole.DOCTOR
  stats: DoctorDashboardStats
  todaySchedule: DashboardAppointment[]
  nextAppointment: DashboardAppointment | null
  availableSlots: DashboardFreeSlot[]
  recentActivity: DashboardActivity[]
}

export interface PatientDashboard extends DashboardBase {
  role: OrganizationUserRole.PATIENT
  stats: PatientDashboardStats
  nextAppointment: DashboardAppointment | null
  upcomingAppointments: DashboardAppointment[]
  reminders: DashboardReminder[]
  reminderSummary: DashboardReminderSummary
}

export type DashboardData =
  | AdminReceptionDashboard
  | DoctorDashboard
  | PatientDashboard
