import { OrganizationUserRole } from '@zdravstvo/contracts'

import type { AppIconName } from '@/types'

export type AppHeaderVariant = 'workspace' | 'clinical' | 'patient'

export interface SidebarSupportConfig {
  title: string
  text: string
  actionLabel: string
  brandIcon: AppIconName | null
  collapseLabel?: string
}

export interface RoleShellConfig {
  roleLabel: string
  headerVariant: AppHeaderVariant
  searchPlaceholder: string
  notificationCount: number
  dateLabel: string
  workspaceName: string
  sidebar: SidebarSupportConfig
}

const SHARED_WORKSPACE_NAME = 'Poliklinika Medica Zagreb'

const DEFAULT_SHELL_CONFIG: RoleShellConfig = {
  roleLabel: 'Korisnik',
  headerVariant: 'workspace',
  searchPlaceholder: 'Pretražite...',
  notificationCount: 0,
  dateLabel: 'Danas',
  workspaceName: SHARED_WORKSPACE_NAME,
  sidebar: {
    title: 'Trebate pomoc?',
    text: 'Tu smo da vam pomognemo.',
    actionLabel: 'Kontaktirajte podršku',
    brandIcon: null,
  },
}

const ROLE_SHELL_CONFIG: Record<OrganizationUserRole, RoleShellConfig> = {
  [OrganizationUserRole.MANAGER]: {
    roleLabel: 'Upravitelj',
    headerVariant: 'workspace',
    searchPlaceholder: 'Pretražite pacijente, termine, liječnike...',
    notificationCount: 8,
    dateLabel: 'Petak, 23. svibnja 2025.',
    workspaceName: SHARED_WORKSPACE_NAME,
    sidebar: {
      title: 'Trebate pomoc?',
      text: 'Tu smo da vam pomognemo.',
      actionLabel: 'Kontaktirajte podršku',
      brandIcon: null,
    },
  },
  [OrganizationUserRole.RECEPTION]: {
    roleLabel: 'Recepcija',
    headerVariant: 'workspace',
    searchPlaceholder: 'Pretražite pacijente, termine, liječnike...',
    notificationCount: 8,
    dateLabel: 'Petak, 23. svibnja 2025.',
    workspaceName: SHARED_WORKSPACE_NAME,
    sidebar: {
      title: 'Trebate pomoc?',
      text: 'Tu smo da vam pomognemo.',
      actionLabel: 'Kontaktirajte podršku',
      brandIcon: null,
    },
  },
  [OrganizationUserRole.DOCTOR]: {
    roleLabel: 'Opća medicina',
    headerVariant: 'clinical',
    searchPlaceholder: 'Pretraži pacijente, termine...',
    notificationCount: 3,
    dateLabel: '21. svibnja 2024.',
    workspaceName: SHARED_WORKSPACE_NAME,
    sidebar: {
      title: 'Brzi pristup',
      text: 'Sakrijte izbornik kada trebate vise prostora.',
      actionLabel: 'Sakrij izbornik',
      brandIcon: null,
      collapseLabel: 'Sakrij izbornik',
    },
  },
  [OrganizationUserRole.PATIENT]: {
    roleLabel: 'Pacijent',
    headerVariant: 'patient',
    searchPlaceholder: 'Pretražite termine, ustanove...',
    notificationCount: 2,
    dateLabel: 'Danas',
    workspaceName: SHARED_WORKSPACE_NAME,
    sidebar: {
      title: 'Trebate pomoc?',
      text: 'Kontaktirajte našu podršku',
      actionLabel: 'Podrska 0800 1234',
      brandIcon: 'shield',
    },
  },
}

const SYSTEM_ADMIN_SHELL_CONFIG: RoleShellConfig = {
  roleLabel: 'Sistem administrator',
  headerVariant: 'workspace',
  searchPlaceholder: 'Pretražite organizacije, korisnike...',
  notificationCount: 0,
  dateLabel: 'Danas',
  workspaceName: 'Zdravstvo Admin',
  sidebar: {
    title: 'Administracija',
    text: 'Upravljanje sustavom.',
    actionLabel: 'Kontaktirajte podršku',
    brandIcon: 'shield',
  },
}

export const getRoleShellConfig = (
  role: OrganizationUserRole | null,
  isSystemAdmin?: boolean | null,
): RoleShellConfig => {
  if (isSystemAdmin) return SYSTEM_ADMIN_SHELL_CONFIG
  return role ? ROLE_SHELL_CONFIG[role] : DEFAULT_SHELL_CONFIG
}
