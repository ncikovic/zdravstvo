import { OrganizationUserRole } from '@zdravstvo/contracts'

import type { AppNavigationItem } from '@/types'

import { APP_ROUTES } from '../routes'

const ADMIN_RECEPTION_ROLES: readonly OrganizationUserRole[] = [
  OrganizationUserRole.ADMIN,
  OrganizationUserRole.RECEPTION,
]

export const APP_NAVIGATION_ITEMS: readonly AppNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Nadzorna ploča',
    path: APP_ROUTES.dashboard,
    icon: 'dashboard',
    allowedRoles: [
      OrganizationUserRole.ADMIN,
      OrganizationUserRole.RECEPTION,
      OrganizationUserRole.DOCTOR,
      OrganizationUserRole.PATIENT,
    ],
    section: 'primary',
  },
  {
    id: 'appointments',
    label: 'Termini',
    path: APP_ROUTES.appointments,
    icon: 'calendar',
    allowedRoles: ADMIN_RECEPTION_ROLES,
    section: 'clinical',
  },
  {
    id: 'doctors',
    label: 'Liječnici',
    path: APP_ROUTES.doctors,
    icon: 'doctor',
    allowedRoles: ADMIN_RECEPTION_ROLES,
    section: 'clinical',
  },
  {
    id: 'patients',
    label: 'Pacijenti',
    path: APP_ROUTES.patients,
    icon: 'patients',
    allowedRoles: [
      OrganizationUserRole.ADMIN,
      OrganizationUserRole.RECEPTION,
      OrganizationUserRole.DOCTOR,
    ],
    section: 'clinical',
  },
  {
    id: 'appointment-types',
    label: 'Vrste termina',
    path: APP_ROUTES.appointmentTypes,
    icon: 'tag',
    allowedRoles: ADMIN_RECEPTION_ROLES,
    section: 'administration',
  },
  {
    id: 'audit',
    label: 'Audit',
    path: APP_ROUTES.audit,
    icon: 'shieldCheck',
    allowedRoles: ADMIN_RECEPTION_ROLES,
    section: 'administration',
  },
  {
    id: 'doctor-schedule',
    label: 'Moj raspored',
    path: APP_ROUTES.schedule,
    icon: 'calendar',
    allowedRoles: [OrganizationUserRole.DOCTOR],
    section: 'clinical',
  },
  {
    id: 'patient-appointments',
    label: 'Moji termini',
    path: APP_ROUTES.myAppointments,
    icon: 'calendar',
    allowedRoles: [OrganizationUserRole.PATIENT],
    section: 'clinical',
  },
  {
    id: 'accessibility',
    label: 'Pristupacnost',
    path: APP_ROUTES.accessibility,
    icon: 'accessibility',
    allowedRoles: [OrganizationUserRole.PATIENT],
    section: 'system',
  },
  {
    id: 'settings',
    label: 'Postavke',
    path: APP_ROUTES.settings,
    icon: 'settings',
    allowedRoles: [
      OrganizationUserRole.ADMIN,
      OrganizationUserRole.RECEPTION,
      OrganizationUserRole.DOCTOR,
      OrganizationUserRole.PATIENT,
    ],
    section: 'system',
  },
]
