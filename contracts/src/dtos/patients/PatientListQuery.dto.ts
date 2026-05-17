import { z } from "zod";

export const patientListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export type PatientListQueryDto = z.infer<typeof patientListQuerySchema>;
