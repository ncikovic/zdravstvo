import { z } from "zod";

export const appointmentIdParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export type AppointmentIdParamsDto = z.infer<typeof appointmentIdParamsSchema>;
