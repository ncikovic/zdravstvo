import type { OrganizationUserRole } from '@zdravstvo/contracts'

export type AppIconName =
  | 'accessibility'
  | 'activity'
  | 'bell'
  | 'building'
  | 'calendar'
  | 'calendarCheck'
  | 'checkCircle'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'clipboard'
  | 'clock'
  | 'dashboard'
  | 'doctor'
  | 'dots'
  | 'edit'
  | 'flask'
  | 'headphones'
  | 'heartPulse'
  | 'home'
  | 'info'
  | 'mail'
  | 'mapPin'
  | 'megaphone'
  | 'note'
  | 'patients'
  | 'phone'
  | 'plus'
  | 'search'
  | 'send'
  | 'settings'
  | 'shield'
  | 'shieldCheck'
  | 'stethoscope'
  | 'tag'
  | 'trash'
  | 'user'
  | 'users'
  | 'warning'
  | 'xCircle'

export type AppNavigationSection = 'primary' | 'clinical' | 'administration' | 'system'

export interface AppNavigationItem {
  id: string
  label: string
  path: string
  icon: AppIconName
  allowedRoles: readonly OrganizationUserRole[]
  isSystemAdminItem?: boolean
  section?: AppNavigationSection
}
