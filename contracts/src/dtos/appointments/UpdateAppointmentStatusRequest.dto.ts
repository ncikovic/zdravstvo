import { z } from "zod";

export const updateAppointmentStatusRequestSchema = z.object({
  status: z.enum(["COMPLETED", "NO_SHOW"]),
});

export type UpdateAppointmentStatusRequestDto = z.infer<
  typeof updateAppointmentStatusRequestSchema
>;
