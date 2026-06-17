import type { DoctorResponseDto } from "./DoctorResponse.dto.js";

export interface DoctorListResponseDto {
  doctors: DoctorResponseDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
