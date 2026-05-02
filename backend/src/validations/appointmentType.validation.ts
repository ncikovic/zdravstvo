import { z } from 'zod';

export const createAppointmentTypeSchema = z.strictObject({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  defaultDurationMinutes: z.number().int().positive().max(1440),
  isActive: z.boolean().optional(),
});

export const updateAppointmentTypeSchema = createAppointmentTypeSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one appointment type field must be provided.',
  });
