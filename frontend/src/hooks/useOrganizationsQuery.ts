import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { OrganizationListQueryDto } from '@zdravstvo/contracts';

import { organizationsService, type OrganizationListResult } from '@/services';
import type { AppApiError } from '@/types';

export const organizationsQueryKeys = {
  all: ['organizations'] as const,
  publicList: (query: OrganizationListQueryDto) =>
    [...organizationsQueryKeys.all, 'public', query] as const,
};

export const usePublicOrganizationsQuery = (
  query: OrganizationListQueryDto,
  enabled = true,
): UseQueryResult<OrganizationListResult, AppApiError> => {
  return useQuery({
    queryKey: organizationsQueryKeys.publicList(query),
    queryFn: () => organizationsService.listPublic(query),
    enabled,
  });
};
