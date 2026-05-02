import type { AppIconName } from '@/types'

import type { DashboardStat, DashboardTone } from './dashboard.types'

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

export interface PatientReminder {
  icon: AppIconName
  title: string
  meta: string
  status: string
  tone: DashboardTone
}

export const adminStats: readonly DashboardStat[] = [
  {
    icon: 'calendar',
    label: 'Današnji termini',
    value: '28',
    meta: '+12% u odnosu na jučer',
    tone: 'blue',
    trend: 'up',
  },
  {
    icon: 'user',
    label: 'Aktivni liječnici',
    value: '14',
    meta: 'Svi liječnici dostupni',
    tone: 'teal',
  },
  {
    icon: 'users',
    label: 'Novi pacijenti',
    value: '18',
    meta: '+8% u odnosu na jučer',
    tone: 'purple',
    trend: 'up',
  },
  {
    icon: 'bell',
    label: 'Podsjetnici za danas',
    value: '42',
    meta: '92% uspješnost dostave',
    tone: 'green',
  },
]

export const adminScheduleRows: readonly AdminScheduleRow[] = [
  {
    time: '09:00',
    patientName: 'Ivana Horvat',
    patientMeta: '1985.',
    doctorName: 'dr. Petra Kovač',
    doctorSpecialty: 'Internist',
    doctorInitials: 'PK',
    type: 'Kontrolni pregled',
    typeTone: 'blue',
    status: 'Potvrđeno',
    statusTone: 'teal',
  },
  {
    time: '10:30',
    patientName: 'Marko Jurić',
    patientMeta: '1978.',
    doctorName: 'dr. Ivan Babić',
    doctorSpecialty: 'Kardiolog',
    doctorInitials: 'IB',
    type: 'Kardiološki pregled',
    typeTone: 'purple',
    status: 'Potvrđeno',
    statusTone: 'teal',
  },
  {
    time: '11:45',
    patientName: 'Ana Radić',
    patientMeta: '1992.',
    doctorName: 'dr. Petra Kovač',
    doctorSpecialty: 'Internist',
    doctorInitials: 'PK',
    type: 'Laboratorijske pretrage',
    typeTone: 'orange',
    status: 'Na čekanju',
    statusTone: 'orange',
  },
  {
    time: '13:30',
    patientName: 'Luka Perić',
    patientMeta: '1968.',
    doctorName: 'dr. Ivan Babić',
    doctorSpecialty: 'Kardiolog',
    doctorInitials: 'IB',
    type: 'Kontrolni pregled',
    typeTone: 'blue',
    status: 'Potvrđeno',
    statusTone: 'teal',
  },
  {
    time: '15:00',
    patientName: 'Marija Blažević',
    patientMeta: '1980.',
    doctorName: 'dr. Petra Kovač',
    doctorSpecialty: 'Internist',
    doctorInitials: 'PK',
    type: 'Savjetovanje',
    typeTone: 'green',
    status: 'Potvrđeno',
    statusTone: 'teal',
  },
]

export const adminAvailableSlots: readonly CompactItem[] = [
  {
    icon: 'calendar',
    title: 'Danas • 16:30',
    meta: 'dr. Ivan Babić • Kardiolog • 30 min',
    tone: 'blue',
    actionLabel: 'Rezerviraj',
  },
  {
    icon: 'calendar',
    title: 'Danas • 17:00',
    meta: 'dr. Petra Kovač • Internist • 20 min',
    tone: 'purple',
    actionLabel: 'Rezerviraj',
  },
  {
    icon: 'calendar',
    title: 'Sutra • 08:30',
    meta: 'dr. Luka Jurić • Ortoped • 30 min',
    tone: 'teal',
    actionLabel: 'Rezerviraj',
  },
]

export const adminNotifications: readonly CompactItem[] = [
  {
    icon: 'mail',
    title: '15 podsjetnika zakazano za danas',
    meta: 'Sljedeći podsjetnik u 09:00',
    tone: 'orange',
  },
  {
    icon: 'send',
    title: '3 neuspješna podsjetnika',
    meta: 'Ponovno slanje u tijeku',
    tone: 'teal',
  },
]

export const adminActivityMetrics: readonly ActivityMetric[] = [
  {
    icon: 'calendar',
    label: 'Ukupno termina (danas)',
    value: '28',
    meta: '+12% u odnosu na jučer',
    tone: 'blue',
  },
  {
    icon: 'user',
    label: 'Završeni termini (danas)',
    value: '16',
    meta: '57% od ukupno',
    tone: 'teal',
  },
  {
    icon: 'users',
    label: 'Čekaju potvrdu',
    value: '5',
    meta: 'Potrebna akcija',
    tone: 'purple',
  },
  {
    icon: 'warning',
    label: 'Otkazani termini',
    value: '2',
    meta: '-20% u odnosu na jučer',
    tone: 'orange',
  },
  {
    icon: 'mail',
    label: 'Poslani podsjetnici',
    value: '42',
    meta: '92% uspješnost dostave',
    tone: 'green',
  },
]

export const doctorStats: readonly DashboardStat[] = [
  {
    icon: 'calendar',
    label: 'Današnji termini',
    value: '12',
    meta: '+2 u odnosu na jučer',
    tone: 'blue',
    trend: 'up',
  },
  {
    icon: 'user',
    label: 'Pacijenti danas',
    value: '11',
    meta: '+1 u odnosu na jučer',
    tone: 'teal',
    trend: 'up',
  },
  {
    icon: 'clock',
    label: 'Slobodni blokovi',
    value: '2',
    meta: 'Sljedeći u 15:30',
    tone: 'orange',
  },
  {
    icon: 'checkCircle',
    label: 'Označeno kao obavljeno',
    value: '8',
    meta: '67% od današnjih termina',
    tone: 'purple',
  },
]

export const doctorScheduleRows: readonly DoctorScheduleRow[] = [
  {
    time: '08:00',
    initials: 'MM',
    name: 'Marko Mandić',
    meta: '1985. • 12345678901',
    type: 'Kontrolni pregled',
    tone: 'blue',
    current: true,
  },
  {
    time: '08:30',
    initials: 'IK',
    name: 'Ivana Kovač',
    meta: '1992. • 98765432109',
    type: 'Prvi pregled',
    tone: 'teal',
    current: true,
  },
  {
    time: '09:00',
    initials: 'LB',
    name: 'Luka Babić',
    meta: '1978. • 45678912345',
    type: 'Kontrolni pregled',
    tone: 'blue',
    current: true,
  },
  {
    time: '09:30',
    initials: 'MŠ',
    name: 'Marija Šimić',
    meta: '1965. • 32145698701',
    type: 'Izdavanje recepta',
    tone: 'teal',
    current: true,
  },
  {
    time: '10:00',
    initials: 'TP',
    name: 'Tin Perić',
    meta: '1990. • 15975348620',
    type: 'Prvi pregled',
    tone: 'blue',
  },
]

export const doctorActivities: readonly CompactItem[] = [
  {
    icon: 'clipboard',
    title: 'Zabilježene vitalne vrijednosti za pacijenta Marko Mandić',
    meta: 'Krvni tlak: 125/78 mmHg, Puls: 72/min',
    tone: 'blue',
  },
  {
    icon: 'calendar',
    title: 'Dodana bilješka za pacijenticu Marija Šimić',
    meta: 'Preporučena promjena terapije.',
    tone: 'teal',
  },
  {
    icon: 'flask',
    title: 'Novi laboratorijski nalaz za pacijenta Luka Babić',
    meta: 'Kompletna krvna slika',
    tone: 'purple',
  },
]

export const doctorNotes: readonly CompactItem[] = [
  {
    icon: 'bell',
    title: 'Ne zaboraviti provjeriti nalaze za pacijenta Marka M.',
    meta: 'Danas, 12:00',
    tone: 'blue',
  },
  {
    icon: 'bell',
    title: 'Podsjetiti pacijenticu Ivanu K. na kontrolu za 2 tjedna.',
    meta: '23. svibnja 2024.',
    tone: 'blue',
  },
]

export const patientStats: readonly DashboardStat[] = [
  {
    icon: 'calendarCheck',
    label: 'Sljedeći termin',
    value: '15. svibnja',
    meta: 'četvrtak u 10:30',
    tone: 'teal',
    actionLabel: 'Pogledaj detalje',
  },
  {
    icon: 'heartPulse',
    label: 'Potvrđeni termini',
    value: '3',
    meta: 'u narednih 30 dana',
    tone: 'blue',
    actionLabel: 'Pregledaj termine',
  },
  {
    icon: 'bell',
    label: 'Podsjetnici',
    value: '2',
    meta: 'aktivna podsjetnika',
    tone: 'green',
    actionLabel: 'Pogledaj podsjetnike',
  },
  {
    icon: 'megaphone',
    label: 'Obavijesti',
    value: '1',
    meta: 'nova obavijest',
    tone: 'blue',
    actionLabel: 'Pogledaj obavijesti',
  },
]

export const patientReminders: readonly PatientReminder[] = [
  {
    icon: 'bell',
    title: 'Podsjetnik: Redovni pregled',
    meta: '15. svibnja 2025. u 10:30',
    status: 'Aktivno',
    tone: 'teal',
  },
  {
    icon: 'bell',
    title: 'Podsjetnik: Laboratorijska pretraga',
    meta: '20. svibnja 2025. u 08:00',
    status: 'Aktivno',
    tone: 'teal',
  },
  {
    icon: 'megaphone',
    title: 'Nova obavijest iz Doma zdravlja',
    meta: 'Sigurnosno ažuriranje dostupno',
    status: 'Novo',
    tone: 'blue',
  },
]
