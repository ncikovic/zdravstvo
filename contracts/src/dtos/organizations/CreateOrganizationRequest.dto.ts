import { z } from 'zod';

const optionalNullableString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable().optional();

const optionalNullableEmail = z
  .union([z.string().trim().min(1).max(255).pipe(z.email()), z.null()])
  .optional();

export const createOrganizationRequestSchema = z.object({
  name: z.string().trim().min(1).max(255),
  address: optionalNullableString(255),
  city: optionalNullableString(120),
  phone: optionalNullableString(60),
  email: optionalNullableEmail,
  timezone: z.string().trim().min(1).max(64),
});

export type CreateOrganizationRequestDto = z.infer<typeof createOrganizationRequestSchema>;
