import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "SCHEDULED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

export type AppointmentStatusDto = z.infer<typeof appointmentStatusSchema>;

export interface AppointmentDoctorSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
}

export interface AppointmentPatientSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
}

export interface AppointmentTypeSummaryDto {
  id: string;
  name: string;
  defaultDurationMinutes: number;
}

export interface AppointmentResponseDto {
  id: string;
  organizationId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatusDto;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: AppointmentDoctorSummaryDto;
  patient: AppointmentPatientSummaryDto;
  appointmentType: AppointmentTypeSummaryDto;
}
