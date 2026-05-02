import type { AppIconName } from '@/types'

export type DashboardTone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'teal'

export type DashboardTrend = 'down' | 'neutral' | 'up'

export interface DashboardStat {
  icon: AppIconName
  label: string
  value: string
  meta: string
  tone: DashboardTone
  actionLabel?: string
  trend?: DashboardTrend
}

export interface AdminScheduleRow {
  time: string
  patientName: string
  patientMeta: string
  doctorName: string
  doctorSpecialty: string
  doctorInitials: string
  type: string
  typeTone: DashboardTone
  status: string
  statusTone: DashboardTone
}

export interface CompactItem {
  icon: AppIconName
  title: string
  meta: string
  tone: DashboardTone
  actionLabel?: string
}

export interface ActivityMetric {
  icon: AppIconName
  label: string
  value: string
  meta: string
  tone: DashboardTone
}

export interface DoctorScheduleRow {
  time: string
  initials: string
  name: string
  meta: string
  type: string
  tone: DashboardTone
  current?: boolean
}

export interface DoctorNextPatient {
  initials: string
  name: string
  meta: string
  time: string
  relativeTime: string
  appointmentType: string
  note: string
}

export interface PatientAppointmentDetails {
  status: string
  statusTone: DashboardTone
  doctorInitials: string
  doctorName: string
  doctorTitle: string
  date: string
  weekday: string
  time: string
  duration: string
  location: string
  locationMeta: string
  appointmentType: string
  note: string
}

export interface PatientReminder {
  icon: AppIconName
  title: string
  meta: string
  status: string
  tone: DashboardTone
}

export interface AdminReceptionDashboardView {
  dateLabel: string
  stats: DashboardStat[]
  scheduleRows: AdminScheduleRow[]
  availableSlots: CompactItem[]
  notifications: CompactItem[]
  activityMetrics: ActivityMetric[]
}

export interface DoctorDashboardView {
  stats: DashboardStat[]
  scheduleRows: DoctorScheduleRow[]
  activities: CompactItem[]
  nextPatient: DoctorNextPatient | null
  availableSlots: CompactItem[]
}

export interface PatientDashboardView {
  stats: DashboardStat[]
  nextAppointment: PatientAppointmentDetails | null
  reminders: PatientReminder[]
}
