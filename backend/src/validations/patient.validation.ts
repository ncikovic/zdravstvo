import { z } from 'zod';

import { nullableDateSchema } from './common.validation.js';

export const createPatientSchema = z.strictObject({
  id: z.string().uuid().optional(),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  dateOfBirth: nullableDateSchema,
  oib: z.string().trim().min(1).max(32).nullable().optional(),
  address: z.string().trim().min(1).max(255).nullable().optional(),
  emergencyContactName: z.string().trim().min(1).max(120).nullable().optional(),
  emergencyContactPhone: z.string().trim().min(1).max(60).nullable().optional(),
});

export const updatePatientSchema = createPatientSchema
  .omit({ id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one patient field must be provided.',
  });
