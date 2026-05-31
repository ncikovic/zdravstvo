import type {
  NotificationListQueryDto,
  NotificationListResponseDto,
  UnreadNotificationCountResponseDto,
} from '@zdravstvo/contracts';

import { apiClient } from '@/services/api';

const buildQuery = (params: NotificationListQueryDto): string => {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.unreadOnly) q.set('unreadOnly', String(params.unreadOnly));
  return q.toString() ? `?${q.toString()}` : '';
};

export const notificationsService = {
  async list(params: NotificationListQueryDto = { page: 1 }): Promise<NotificationListResponseDto> {
    const response = await apiClient.get<NotificationListResponseDto>(
      `/notifications${buildQuery(params)}`,
    );
    return response.data;
  },

  async unreadCount(): Promise<UnreadNotificationCountResponseDto> {
    const response = await apiClient.get<UnreadNotificationCountResponseDto>(
      '/notifications/unread-count',
    );
    return response.data;
  },

  async markRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
