import { z } from "zod";

export const doctorIdParamsSchema = z.object({
  id: z.uuid(),
});

export const doctorTimeOffIdParamsSchema = doctorIdParamsSchema.extend({
  timeOffId: z.uuid(),
});

export type DoctorIdParamsDto = z.infer<typeof doctorIdParamsSchema>;
export type DoctorTimeOffIdParamsDto = z.infer<
  typeof doctorTimeOffIdParamsSchema
>;
