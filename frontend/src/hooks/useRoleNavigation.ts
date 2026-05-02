import type { OrganizationUserRole } from '@zdravstvo/contracts'
import { useMemo } from 'react'

import { APP_NAVIGATION_ITEMS } from '@/app/config'
import type { AppNavigationItem } from '@/types'

export const getNavigationForRole = (
  role: OrganizationUserRole | null,
): AppNavigationItem[] => {
  if (!role) {
    return []
  }

  return APP_NAVIGATION_ITEMS.filter((item) => item.allowedRoles.includes(role))
}

export const useRoleNavigation = (
  role: OrganizationUserRole | null,
): AppNavigationItem[] =>
  useMemo(() => getNavigationForRole(role), [role])
