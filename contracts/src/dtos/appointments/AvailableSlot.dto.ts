import { z } from "zod";

export const availableAppointmentSlotsQuerySchema = z.strictObject({
  date: z.iso.date(),
  appointmentTypeId: z.string().uuid(),
  doctorId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export type AvailableAppointmentSlotsQueryDto = z.infer<
  typeof availableAppointmentSlotsQuerySchema
>;

export interface AppointmentAvailableSlotDto {
  doctorId: string;
  doctorName: string;
  doctorTitle: string | null;
  startAt: string;
  endAt: string;
  durationMinutes: number;
}

export interface AppointmentAvailableSlotListResponseDto {
  slots: AppointmentAvailableSlotDto[];
}
