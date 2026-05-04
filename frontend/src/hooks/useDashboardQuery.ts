import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { OrganizationUserRole } from '@zdravstvo/contracts'

import { dashboardService } from '@/services'
import type { AppApiError, DashboardData } from '@/types'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  current: (role: OrganizationUserRole | null, date: string) =>
    [...dashboardQueryKeys.all, 'current', role, date] as const,
}

export const useDashboardQuery = (
  role: OrganizationUserRole | null,
  date: string,
): UseQueryResult<DashboardData, AppApiError> => {
  return useQuery({
    queryKey: dashboardQueryKeys.current(role, date),
    queryFn: () => dashboardService.getCurrent({ date }),
    enabled: Boolean(role && date),
    throwOnError: false,
  })
}
