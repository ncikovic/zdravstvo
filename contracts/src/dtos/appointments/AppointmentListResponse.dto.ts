import type { AppointmentResponseDto } from "./Appointment.dto.js";

export interface AppointmentListResponseDto {
  appointments: AppointmentResponseDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
