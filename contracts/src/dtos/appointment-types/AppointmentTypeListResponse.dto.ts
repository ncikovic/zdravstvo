import type { AppointmentTypeDto } from "./AppointmentType.dto.js";

export interface AppointmentTypeListResponseDto {
  appointmentTypes: AppointmentTypeDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
