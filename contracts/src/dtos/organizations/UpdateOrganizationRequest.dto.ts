import { z } from 'zod';

const optionalNullableString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable().optional();

const optionalNullableEmail = z
  .union([z.string().trim().min(1).max(255).pipe(z.email()), z.null()])
  .optional();

export const updateOrganizationRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    address: optionalNullableString(255),
    city: optionalNullableString(120),
    phone: optionalNullableString(60),
    email: optionalNullableEmail,
    timezone: z.string().trim().min(1).max(64).optional(),
  })
  .refine((payload) => Object.values(payload).some((value) => value !== undefined), {
    message: 'At least one field must be provided.',
  });

export type UpdateOrganizationRequestDto = z.infer<typeof updateOrganizationRequestSchema>;
