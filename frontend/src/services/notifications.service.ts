import type {
  NotificationListQueryDto,
  NotificationListResponseDto,
} from '@zdravstvo/contracts';

import { apiClient } from '@/services/api';

const buildQuery = (params: NotificationListQueryDto): string => {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.status) q.set('status', params.status);
  if (params.channel) q.set('channel', params.channel);
  if (params.dateFrom) q.set('dateFrom', params.dateFrom);
  if (params.dateTo) q.set('dateTo', params.dateTo);
  return q.toString() ? `?${q.toString()}` : '';
};

export const notificationsService = {
  async list(params: NotificationListQueryDto = { page: 1 }): Promise<NotificationListResponseDto> {
    const response = await apiClient.get<NotificationListResponseDto>(
      `/notifications${buildQuery(params)}`,
    );
    return response.data;
  },
};
