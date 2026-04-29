import { z } from "zod";

const optionalNullableString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable().optional();

export const updateDoctorRequestSchema = z
  .object({
    firstName: z.string().trim().min(1).max(120).optional(),
    lastName: z.string().trim().min(1).max(120).optional(),
    title: optionalNullableString(120),
    licenseNumber: optionalNullableString(64),
    bio: optionalNullableString(5000),
    isActive: z.boolean().optional(),
  })
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: "At least one field must be provided.",
    },
  );

export type UpdateDoctorRequestDto = z.infer<typeof updateDoctorRequestSchema>;
