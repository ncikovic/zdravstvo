export type NotificationChannelDto = 'EMAIL' | 'SMS';
export type NotificationStatusDto = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationAppointmentDto {
  id: string;
  startAt: string;
  endAt: string;
  patientFirstName: string;
  patientLastName: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorTitle: string | null;
  appointmentTypeName: string;
}

export interface NotificationDto {
  id: string;
  appointmentId: string;
  channel: NotificationChannelDto;
  scheduledFor: string;
  sentAt: string | null;
  status: NotificationStatusDto;
  attemptCount: number;
  lastError: string | null;
  appointment: NotificationAppointmentDto;
}

export interface NotificationSummaryDto {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}
