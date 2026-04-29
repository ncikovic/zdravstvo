import { z } from "zod";

const optionalNullableString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable().optional();

const optionalNullableEmail = z
  .union([z.string().trim().min(1).max(255).pipe(z.email()), z.null()])
  .optional();

export const createDoctorRequestSchema = z.object({
  userId: z.uuid().optional(),
  email: optionalNullableEmail,
  phone: optionalNullableString(60),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  title: optionalNullableString(120),
  licenseNumber: optionalNullableString(64),
  bio: optionalNullableString(5000),
  isActive: z.boolean().optional(),
});

export type CreateDoctorRequestDto = z.infer<typeof createDoctorRequestSchema>;
