import { z } from "zod";

const optionalNullableText = (maxLength: number) =>
  z.string().trim().max(maxLength).nullable().optional();

export const createAppointmentRequestSchema = z.strictObject({
  doctorId: z.string().uuid(),
  patientId: z.string().uuid(),
  appointmentTypeId: z.string().uuid(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime().optional(),
  notes: optionalNullableText(5000),
});

export type CreateAppointmentRequestDto = z.infer<
  typeof createAppointmentRequestSchema
>;
