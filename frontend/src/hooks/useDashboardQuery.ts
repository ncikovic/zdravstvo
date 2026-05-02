import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { OrganizationUserRole } from '@zdravstvo/contracts'

import { dashboardService } from '@/services'
import type { AppApiError, DashboardData } from '@/types'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  current: (role: OrganizationUserRole | null) =>
    [...dashboardQueryKeys.all, 'current', role] as const,
}

export const useDashboardQuery = (
  role: OrganizationUserRole | null,
): UseQueryResult<DashboardData, AppApiError> => {
  return useQuery({
    queryKey: dashboardQueryKeys.current(role),
    queryFn: () => dashboardService.getCurrent(),
    enabled: Boolean(role),
  })
}
