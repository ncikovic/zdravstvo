import { z } from "zod";

export const doctorListQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type DoctorListQueryDto = z.infer<typeof doctorListQuerySchema>;
