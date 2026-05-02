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
  | 'flask'
  | 'headphones'
  | 'heartPulse'
  | 'home'
  | 'info'
  | 'mail'
  | 'megaphone'
  | 'note'
  | 'patients'
  | 'plus'
  | 'search'
  | 'send'
  | 'settings'
  | 'shield'
  | 'shieldCheck'
  | 'stethoscope'
  | 'tag'
  | 'user'
  | 'users'
  | 'warning'

export type AppNavigationSection = 'primary' | 'clinical' | 'administration' | 'system'

export interface AppNavigationItem {
  id: string
  label: string
  path: string
  icon: AppIconName
  allowedRoles: readonly OrganizationUserRole[]
  section?: AppNavigationSection
}
