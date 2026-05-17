import { z } from "zod";

export const appointmentTypeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export type AppointmentTypeListQueryDto = z.infer<typeof appointmentTypeListQuerySchema>;
