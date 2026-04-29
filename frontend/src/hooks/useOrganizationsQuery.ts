import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { organizationsService } from '@/services';
import type { AppApiError, Organization } from '@/types';

export const organizationsQueryKeys = {
  all: ['organizations'] as const,
  publicList: () => [...organizationsQueryKeys.all, 'public'] as const,
};

export const usePublicOrganizationsQuery = (): UseQueryResult<Organization[], AppApiError> => {
  return useQuery({
    queryKey: organizationsQueryKeys.publicList(),
    queryFn: () => organizationsService.listPublic(),
  });
};
