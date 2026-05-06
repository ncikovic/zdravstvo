import type { AppointmentResponseDto } from "./Appointment.dto.js";

export interface AppointmentListResponseDto {
  appointments: AppointmentResponseDto[];
}
