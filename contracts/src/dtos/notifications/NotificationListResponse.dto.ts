import type { NotificationDto, NotificationSummaryDto } from './Notification.dto.js';

export interface NotificationListResponseDto {
  notifications: NotificationDto[];
  summary: NotificationSummaryDto;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
