import type { AuditListQueryDto, AuditLogListResponseDto } from '@zdravstvo/contracts';

import { apiClient } from '@/services/api';

const buildQuery = (params: AuditListQueryDto): string => {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.search) q.set('search', params.search);
  if (params.dateFrom) q.set('dateFrom', params.dateFrom);
  if (params.dateTo) q.set('dateTo', params.dateTo);
  if (params.actorOrgUserId) q.set('actorOrgUserId', params.actorOrgUserId);
  if (params.entityType) q.set('entityType', params.entityType);
  if (params.action) q.set('action', params.action);
  return q.toString() ? `?${q.toString()}` : '';
};

export const adminAuditService = {
  async list(params: AuditListQueryDto = { page: 1 }): Promise<AuditLogListResponseDto> {
    const response = await apiClient.get<AuditLogListResponseDto>(
      `/admin/audit${buildQuery(params)}`,
    );
    return response.data;
  },
};
