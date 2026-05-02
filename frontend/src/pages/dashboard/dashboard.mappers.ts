import type {
  AdminReceptionDashboard,
  DashboardActivity,
  DashboardAppointment,
  DashboardFreeSlot,
  DashboardReminder,
  DoctorDashboard,
  PatientDashboard,
} from '@/types'

import type {
  ActivityMetric,
  AdminReceptionDashboardView,
  AdminScheduleRow,
  CompactItem,
  DashboardStat,
  DashboardTone,
  DoctorDashboardView,
  DoctorNextPatient,
  DoctorScheduleRow,
  PatientAppointmentDetails,
  PatientDashboardView,
  PatientReminder,
} from './dashboard.types'

const timeFormatter = new Intl.DateTimeFormat('hr-HR', {
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('hr-HR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('hr-HR', {
  day: 'numeric',
  month: 'long',
})

const weekdayFormatter = new Intl.DateTimeFormat('hr-HR', {
  weekday: 'long',
})

const dateButtonFormatter = new Intl.DateTimeFormat('hr-HR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const appointmentTypeTones: readonly DashboardTone[] = [
  'blue',
  'teal',
  'purple',
  'orange',
  'green',
]

const capitalize = (value: string): string =>
  value ? `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}` : value

const formatTime = (date: Date): string => timeFormatter.format(date)

const formatDate = (date: Date): string => dateFormatter.format(date)

const formatShortDate = (date: Date): string => shortDateFormatter.format(date)

const formatWeekday = (date: Date): string => weekdayFormatter.format(date)

const formatDateButton = (date: Date): string =>
  capitalize(dateButtonFormatter.format(date))

const formatPersonName = (person: {
  firstName: string
  lastName: string
}): string => `${person.firstName} ${person.lastName}`

const formatDoctorName = (appointment: DashboardAppointment): string =>
  `dr. ${formatPersonName(appointment.doctor)}`

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'K'

const getPatientMeta = (appointment: DashboardAppointment): string => {
  const birthYear = appointment.patient.dateOfBirth
    ? `${appointment.patient.dateOfBirth.getFullYear()}.`
    : null
  const parts = [birthYear, appointment.patient.oib].filter(Boolean)

  return parts.length > 0 ? parts.join(' • ') : 'Pacijent'
}

const getAppointmentTypeTone = (name: string): DashboardTone => {
  const score = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0)

  return appointmentTypeTones[score % appointmentTypeTones.length] ?? 'blue'
}

const getStatusLabel = (status: DashboardAppointment['status']): string => {
  if (status === 'COMPLETED') {
    return 'Obavljeno'
  }

  if (status === 'CANCELLED') {
    return 'Otkazano'
  }

  if (status === 'NO_SHOW') {
    return 'Nije došao'
  }

  return 'Potvrđeno'
}

const getStatusTone = (status: DashboardAppointment['status']): DashboardTone => {
  if (status === 'COMPLETED') {
    return 'green'
  }

  if (status === 'CANCELLED') {
    return 'red'
  }

  if (status === 'NO_SHOW') {
    return 'orange'
  }

  return 'teal'
}

const getReminderStatusLabel = (status: DashboardReminder['status']): string => {
  if (status === 'SENT') {
    return 'Poslano'
  }

  if (status === 'FAILED') {
    return 'Neuspjelo'
  }

  return 'Aktivno'
}

const getReminderStatusTone = (status: DashboardReminder['status']): DashboardTone => {
  if (status === 'SENT') {
    return 'green'
  }

  if (status === 'FAILED') {
    return 'orange'
  }

  return 'teal'
}

const formatRelativeAppointmentTime = (appointment: DashboardAppointment): string => {
  const now = Date.now()
  const start = appointment.startAt.getTime()
  const end = appointment.endAt.getTime()

  if (now >= start && now <= end) {
    return 'u tijeku'
  }

  const minutes = Math.round((start - now) / 60000)

  if (minutes <= 0) {
    return 'završeno'
  }

  if (minutes < 60) {
    return `za ${minutes} min`
  }

  const hours = Math.round(minutes / 60)

  return `za ${hours} h`
}

const formatDuration = (appointment: DashboardAppointment): string => {
  const durationMinutes = Math.max(
    1,
    Math.round((appointment.endAt.getTime() - appointment.startAt.getTime()) / 60000),
  )

  return `${durationMinutes} min`
}

const isSameDate = (firstDate: Date, secondDate: Date): boolean =>
  dateKeyFormatter.format(firstDate) === dateKeyFormatter.format(secondDate)

const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return isSameDate(date, tomorrow)
}

const mapAvailableSlots = (
  slots: readonly DashboardFreeSlot[],
): CompactItem[] => {
  if (slots.length === 0) {
    return [
      {
        icon: 'calendar',
        title: 'Nema slobodnih termina',
        meta: 'Radni raspored je trenutno popunjen',
        tone: 'blue',
      },
    ]
  }

  return slots.map((slot, index) => {
    const dateLabel = isSameDate(slot.startAt, new Date())
      ? 'Danas'
      : isTomorrow(slot.startAt)
        ? 'Sutra'
        : formatShortDate(slot.startAt)

    return {
      icon: 'calendar',
      title: `${dateLabel} • ${formatTime(slot.startAt)}`,
      meta: `dr. ${slot.doctorName} • ${slot.doctorTitle ?? 'Liječnik'} • ${slot.durationMinutes} min`,
      tone: appointmentTypeTones[index % appointmentTypeTones.length] ?? 'blue',
      actionLabel: 'Rezerviraj',
    }
  })
}

const mapAdminScheduleRow = (
  appointment: DashboardAppointment,
): AdminScheduleRow => ({
  time: formatTime(appointment.startAt),
  patientName: formatPersonName(appointment.patient),
  patientMeta: getPatientMeta(appointment),
  doctorName: formatDoctorName(appointment),
  doctorSpecialty: appointment.doctor.title ?? 'Liječnik',
  doctorInitials: getInitials(formatPersonName(appointment.doctor)),
  type: appointment.appointmentType.name,
  typeTone: getAppointmentTypeTone(appointment.appointmentType.name),
  status: getStatusLabel(appointment.status),
  statusTone: getStatusTone(appointment.status),
})

const mapDoctorScheduleRow = (
  appointment: DashboardAppointment,
): DoctorScheduleRow => ({
  time: formatTime(appointment.startAt),
  initials: getInitials(formatPersonName(appointment.patient)),
  name: formatPersonName(appointment.patient),
  meta: getPatientMeta(appointment),
  type: appointment.appointmentType.name,
  tone: getAppointmentTypeTone(appointment.appointmentType.name),
  current: Date.now() >= appointment.startAt.getTime() && Date.now() < appointment.endAt.getTime(),
})

const mapAdminNotifications = (
  dashboard: AdminReceptionDashboard,
): CompactItem[] => {
  if (dashboard.reminderSummary.total === 0) {
    return [
      {
        icon: 'bell',
        title: 'Nema podsjetnika za danas',
        meta: 'Nisu zakazana slanja podsjetnika',
        tone: 'blue',
      },
    ]
  }

  return [
    {
      icon: 'mail',
      title: `${dashboard.reminderSummary.total} podsjetnika zakazano za danas`,
      meta: `${dashboard.reminderSummary.pending} na čekanju, ${dashboard.reminderSummary.sent} poslano`,
      tone: 'orange',
    },
    {
      icon: dashboard.reminderSummary.failed > 0 ? 'warning' : 'send',
      title:
        dashboard.reminderSummary.failed > 0
          ? `${dashboard.reminderSummary.failed} neuspješnih podsjetnika`
          : 'Nema neuspješnih podsjetnika',
      meta: 'Sažetak današnjih slanja',
      tone: dashboard.reminderSummary.failed > 0 ? 'orange' : 'teal',
    },
  ]
}

const mapActivityMetrics = (
  dashboard: AdminReceptionDashboard,
): ActivityMetric[] => {
  const total = dashboard.stats.todayAppointmentCount
  const completedRate = total > 0
    ? Math.round((dashboard.stats.completedAppointmentCount / total) * 100)
    : 0

  return [
    {
      icon: 'calendar',
      label: 'Ukupno termina (danas)',
      value: String(total),
      meta: 'Prema današnjem rasporedu',
      tone: 'blue',
    },
    {
      icon: 'user',
      label: 'Završeni termini (danas)',
      value: String(dashboard.stats.completedAppointmentCount),
      meta: `${completedRate}% od ukupno`,
      tone: 'teal',
    },
    {
      icon: 'users',
      label: 'Zakazani termini',
      value: String(dashboard.stats.scheduledAppointmentCount),
      meta: 'Trenutno potvrđeni',
      tone: 'purple',
    },
    {
      icon: 'warning',
      label: 'Otkazani termini',
      value: String(dashboard.stats.cancelledAppointmentCount),
      meta: 'Danas',
      tone: 'orange',
    },
    {
      icon: 'mail',
      label: 'Poslani podsjetnici',
      value: String(dashboard.stats.sentReminderCount),
      meta: 'Danas',
      tone: 'green',
    },
  ]
}

const mapActivity = (activity: DashboardActivity): CompactItem => {
  const entityLabel =
    activity.entityType === 'APPOINTMENT'
      ? 'termin'
      : activity.entityType === 'PATIENT'
        ? 'pacijent'
        : activity.entityType === 'DOCTOR'
          ? 'liječnik'
          : 'zapis'
  const actionLabel =
    activity.action === 'CREATE'
      ? 'Dodan'
      : activity.action === 'UPDATE'
        ? 'Ažuriran'
        : activity.action === 'CANCEL'
          ? 'Otkazan'
          : 'Promijenjen status za'

  return {
    icon: activity.entityType === 'APPOINTMENT' ? 'calendar' : 'activity',
    title: `${actionLabel} ${entityLabel}`,
    meta: `${formatDate(activity.createdAt)} u ${formatTime(activity.createdAt)}`,
    tone: activity.action === 'CANCEL' ? 'orange' : 'blue',
    actionLabel: formatTime(activity.createdAt),
  }
}

const mapDoctorActivities = (
  activities: readonly DashboardActivity[],
): CompactItem[] => {
  if (activities.length === 0) {
    return [
      {
        icon: 'activity',
        title: 'Nema nedavnih aktivnosti',
        meta: 'Aktivnosti će se prikazati nakon promjena u rasporedu',
        tone: 'blue',
      },
    ]
  }

  return activities.map(mapActivity)
}

const mapDoctorNextPatient = (
  appointment: DashboardAppointment | null,
): DoctorNextPatient | null => {
  if (!appointment) {
    return null
  }

  return {
    initials: getInitials(formatPersonName(appointment.patient)),
    name: formatPersonName(appointment.patient),
    meta: getPatientMeta(appointment),
    time: formatTime(appointment.startAt),
    relativeTime: formatRelativeAppointmentTime(appointment),
    appointmentType: appointment.appointmentType.name,
    note: appointment.notes ?? 'Nema dodatne napomene',
  }
}

const mapPatientAppointmentDetails = (
  dashboard: PatientDashboard,
): PatientAppointmentDetails | null => {
  const appointment = dashboard.nextAppointment

  if (!appointment) {
    return null
  }

  const organizationAddress = [
    dashboard.organization.address,
    dashboard.organization.city,
  ]
    .filter(Boolean)
    .join(', ')

  return {
    status: getStatusLabel(appointment.status),
    statusTone: getStatusTone(appointment.status),
    doctorInitials: getInitials(formatPersonName(appointment.doctor)),
    doctorName: formatDoctorName(appointment),
    doctorTitle: appointment.doctor.title ?? 'Liječnik',
    date: formatDate(appointment.startAt),
    weekday: formatWeekday(appointment.startAt),
    time: formatTime(appointment.startAt),
    duration: formatDuration(appointment),
    location: dashboard.organization.name || 'Odabrana ustanova',
    locationMeta: organizationAddress || 'Detalji lokacije dostupni su u ustanovi',
    appointmentType: appointment.appointmentType.name,
    note: appointment.notes ?? 'Molimo dođite 10 minuta ranije i ponesite zdravstvenu iskaznicu.',
  }
}

const mapPatientReminder = (reminder: DashboardReminder): PatientReminder => ({
  icon: reminder.status === 'FAILED' ? 'warning' : 'bell',
  title: `Podsjetnik: ${reminder.appointment.appointmentType.name}`,
  meta: `${formatDate(reminder.scheduledFor)} u ${formatTime(reminder.scheduledFor)}`,
  status: getReminderStatusLabel(reminder.status),
  tone: getReminderStatusTone(reminder.status),
})

export const mapAdminReceptionDashboard = (
  dashboard: AdminReceptionDashboard,
): AdminReceptionDashboardView => ({
  dateLabel: formatDateButton(dashboard.todayStart),
  stats: [
    {
      icon: 'calendar',
      label: 'Današnji termini',
      value: String(dashboard.stats.todayAppointmentCount),
      meta: 'Prema današnjem rasporedu',
      tone: 'blue',
    },
    {
      icon: 'user',
      label: 'Aktivni liječnici',
      value: String(dashboard.stats.activeDoctorCount),
      meta: 'Aktivno u ustanovi',
      tone: 'teal',
    },
    {
      icon: 'users',
      label: 'Novi pacijenti',
      value: String(dashboard.stats.recentPatientCount),
      meta: 'U zadnjih 30 dana',
      tone: 'purple',
    },
    {
      icon: 'bell',
      label: 'Podsjetnici za danas',
      value: String(dashboard.stats.reminderCount),
      meta: `${dashboard.reminderSummary.pending} na čekanju`,
      tone: 'green',
    },
  ],
  scheduleRows: dashboard.todaySchedule.map(mapAdminScheduleRow),
  availableSlots: mapAvailableSlots(dashboard.availableSlots),
  notifications: mapAdminNotifications(dashboard),
  activityMetrics: mapActivityMetrics(dashboard),
})

export const mapDoctorDashboard = (
  dashboard: DoctorDashboard,
): DoctorDashboardView => ({
  stats: [
    {
      icon: 'calendar',
      label: 'Današnji termini',
      value: String(dashboard.stats.todayAppointmentCount),
      meta: 'Prema današnjem rasporedu',
      tone: 'blue',
    },
    {
      icon: 'user',
      label: 'Pacijenti danas',
      value: String(dashboard.stats.patientsTodayCount),
      meta: 'Jedinstveni pacijenti',
      tone: 'teal',
    },
    {
      icon: 'clock',
      label: 'Slobodni blokovi',
      value: String(dashboard.stats.freeBlockCount),
      meta: dashboard.availableSlots[0]
        ? `Sljedeći u ${formatTime(dashboard.availableSlots[0].startAt)}`
        : 'Nema slobodnih blokova',
      tone: 'orange',
    },
    {
      icon: 'checkCircle',
      label: 'Označeno kao obavljeno',
      value: String(dashboard.stats.completedAppointmentCount),
      meta: 'Danas',
      tone: 'purple',
    },
  ],
  scheduleRows: dashboard.todaySchedule.map(mapDoctorScheduleRow),
  activities: mapDoctorActivities(dashboard.recentActivity),
  nextPatient: mapDoctorNextPatient(dashboard.nextAppointment),
  availableSlots: mapAvailableSlots(dashboard.availableSlots),
})

export const mapPatientDashboard = (
  dashboard: PatientDashboard,
): PatientDashboardView => ({
  stats: [
    {
      icon: 'calendarCheck',
      label: 'Sljedeći termin',
      value: dashboard.nextAppointment
        ? formatShortDate(dashboard.nextAppointment.startAt)
        : 'Nema termina',
      meta: dashboard.nextAppointment
        ? `${formatWeekday(dashboard.nextAppointment.startAt)} u ${formatTime(dashboard.nextAppointment.startAt)}`
        : 'Nema potvrđenih termina',
      tone: 'teal',
      actionLabel: dashboard.nextAppointment ? 'Pogledaj detalje' : undefined,
    },
    {
      icon: 'heartPulse',
      label: 'Potvrđeni termini',
      value: String(dashboard.stats.confirmedFutureAppointmentCount),
      meta: 'U narednih 30 dana',
      tone: 'blue',
      actionLabel: 'Pregledaj termine',
    },
    {
      icon: 'bell',
      label: 'Podsjetnici',
      value: String(dashboard.stats.reminderCount),
      meta: `${dashboard.reminderSummary.pending} aktivno`,
      tone: 'green',
      actionLabel: 'Pogledaj podsjetnike',
    },
    {
      icon: 'megaphone',
      label: 'Obavijesti',
      value: '0',
      meta: 'Nema novih obavijesti',
      tone: 'blue',
      actionLabel: 'Pogledaj obavijesti',
    },
  ],
  nextAppointment: mapPatientAppointmentDetails(dashboard),
  reminders:
    dashboard.reminders.length > 0
      ? dashboard.reminders.map(mapPatientReminder)
      : [
          {
            icon: 'bell',
            title: 'Nema aktivnih podsjetnika',
            meta: 'Podsjetnici će se prikazati uz nadolazeće termine',
            status: 'Mirno',
            tone: 'blue',
          },
        ],
})
