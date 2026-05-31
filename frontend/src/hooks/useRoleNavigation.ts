import type { OrganizationUserRole } from '@zdravstvo/contracts'
import { useMemo } from 'react'

import { APP_NAVIGATION_ITEMS } from '@/app/config'
import { APP_ROUTES } from '@/app/routes'
import type { AppNavigationItem } from '@/types'

export const getNavigationForRole = (
  role: OrganizationUserRole | null,
  isSystemAdmin: boolean | null,
): AppNavigationItem[] => {
  if (isSystemAdmin) {
    return APP_NAVIGATION_ITEMS.filter(
      (item) => item.isSystemAdminItem || item.path === APP_ROUTES.notifications,
    )
  }

  if (!role) {
    return []
  }

  return APP_NAVIGATION_ITEMS.filter(
    (item) => !item.isSystemAdminItem && item.allowedRoles.includes(role),
  )
}

export const useRoleNavigation = (
  role: OrganizationUserRole | null,
  isSystemAdmin: boolean | null = false,
): AppNavigationItem[] =>
  useMemo(() => getNavigationForRole(role, isSystemAdmin), [role, isSystemAdmin])
