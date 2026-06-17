import type { PatientDto } from "./Patient.dto.js";

export interface PatientListResponseDto {
  patients: PatientDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
