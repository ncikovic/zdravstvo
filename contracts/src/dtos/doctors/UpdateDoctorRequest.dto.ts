import { z } from "zod";

const optionalNullableString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable().optional();

const optionalNullableEmail = z
  .union([z.string().trim().min(1).max(255).pipe(z.email()), z.null()])
  .optional();

export const updateDoctorRequestSchema = z
  .object({
    email: optionalNullableEmail,
    phone: optionalNullableString(60),
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

export const updateDoctorSelfRequestSchema = z
  .object({
    email: optionalNullableEmail,
    phone: optionalNullableString(60),
    firstName: z.string().trim().min(1).max(120).optional(),
    lastName: z.string().trim().min(1).max(120).optional(),
    title: optionalNullableString(120),
    bio: optionalNullableString(5000),
  })
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: "At least one field must be provided.",
    },
  );

export type UpdateDoctorSelfRequestDto = z.infer<typeof updateDoctorSelfRequestSchema>;
