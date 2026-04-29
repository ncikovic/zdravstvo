import { z } from "zod";

export const doctorListQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type DoctorListQueryDto = z.infer<typeof doctorListQuerySchema>;
