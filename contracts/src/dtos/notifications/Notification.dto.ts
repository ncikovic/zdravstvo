export type NotificationTypeDto =
  | "APPOINTMENT_REQUEST_SUBMITTED"
  | "APPOINTMENT_REQUEST_RECEIVED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_UPDATED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_STATUS_CHANGED"
  | "APPOINTMENT_REMINDER";

export type NotificationEntityTypeDto = "APPOINTMENT";

export interface NotificationDto {
  id: string;
  organizationId: string;
  recipientUserId: string;
  actorUserId: string | null;
  type: NotificationTypeDto;
  title: string;
  message: string;
  entityType: NotificationEntityTypeDto;
  entityId: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationSummaryDto {
  total: number;
  unread: number;
  read: number;
}
