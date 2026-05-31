import { OrganizationUserRole } from "@zdravstvo/contracts";

import type { AppNavigationItem } from "@/types";

import { APP_ROUTES } from "../routes";

const ORGANIZATION_ROLES = [
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
  OrganizationUserRole.PATIENT,
] as const;

export const APP_NAVIGATION_ITEMS: readonly AppNavigationItem[] = [
  // Shared organization navigation
  {
    id: "dashboard",
    label: "Dashboard",
    path: APP_ROUTES.dashboard,
    icon: "dashboard",
    allowedRoles: ORGANIZATION_ROLES,
    section: "primary",
  },

  // SYSTEM_ADMIN navigation
  {
    id: "admin-organizations",
    label: "Organizacije",
    path: APP_ROUTES.adminOrganizations,
    icon: "building",
    allowedRoles: [],
    isSystemAdminItem: true,
    section: "primary",
  },
  {
    id: "admin-users",
    label: "Korisnici",
    path: APP_ROUTES.adminUsers,
    icon: "users",
    allowedRoles: [],
    isSystemAdminItem: true,
    section: "primary",
  },
  {
    id: "admin-audit",
    label: "Audit",
    path: APP_ROUTES.adminAudit,
    icon: "shieldCheck",
    allowedRoles: [],
    isSystemAdminItem: true,
    section: "administration",
  },

  // MANAGER navigation
  {
    id: "schedule",
    label: "Raspored",
    path: APP_ROUTES.schedule,
    icon: "calendar",
    allowedRoles: [
      OrganizationUserRole.MANAGER,
      OrganizationUserRole.RECEPTION,
    ],
    section: "primary",
  },
  {
    id: "patients",
    label: "Pacijenti",
    path: APP_ROUTES.patients,
    icon: "patients",
    allowedRoles: [
      OrganizationUserRole.MANAGER,
      OrganizationUserRole.RECEPTION,
    ],
    section: "clinical",
  },
  {
    id: "doctors",
    label: "Liječnici",
    path: APP_ROUTES.doctors,
    icon: "doctor",
    allowedRoles: [OrganizationUserRole.MANAGER],
    section: "clinical",
  },
  {
    id: "appointment-types",
    label: "Vrste termina",
    path: APP_ROUTES.appointmentTypes,
    icon: "tag",
    allowedRoles: [OrganizationUserRole.MANAGER],
    section: "administration",
  },
  {
    id: "users",
    label: "Korisnici",
    path: APP_ROUTES.users,
    icon: "users",
    allowedRoles: [OrganizationUserRole.MANAGER],
    section: "administration",
  },
  {
    id: "audit",
    label: "Audit",
    path: APP_ROUTES.audit,
    icon: "shieldCheck",
    allowedRoles: [OrganizationUserRole.MANAGER],
    section: "administration",
  },
  // DOCTOR navigation
  {
    id: "doctor-own-schedule",
    label: "Moj raspored",
    path: APP_ROUTES.doctorOwnSchedule,
    icon: "calendarCheck",
    allowedRoles: [OrganizationUserRole.DOCTOR],
    section: "primary",
  },

  // PATIENT navigation
  {
    id: "my-appointments",
    label: "Moji termini",
    path: APP_ROUTES.myAppointments,
    icon: "calendar",
    allowedRoles: [OrganizationUserRole.PATIENT],
    section: "clinical",
  },
  {
    id: "book-appointment",
    label: "Zakaži termin",
    path: APP_ROUTES.book,
    icon: "plus",
    allowedRoles: [OrganizationUserRole.PATIENT],
    section: "clinical",
  },
  {
    id: "profile",
    label: "Profil",
    path: APP_ROUTES.profile,
    icon: "user",
    allowedRoles: [OrganizationUserRole.PATIENT],
    section: "system",
  },

  // MANAGER settings
  {
    id: "settings",
    label: "Postavke",
    path: APP_ROUTES.settings,
    icon: "settings",
    allowedRoles: [OrganizationUserRole.MANAGER],
    section: "system",
  },
];
