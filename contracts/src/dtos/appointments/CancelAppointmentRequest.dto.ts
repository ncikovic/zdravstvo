import { z } from "zod";

export const cancelAppointmentRequestSchema = z.strictObject({
  cancellationReason: z.string().trim().min(1).max(500),
  notifyPatient: z.boolean().optional(),
});

export type CancelAppointmentRequestDto = z.infer<
  typeof cancelAppointmentRequestSchema
>;
