import { z } from 'zod';

export const idParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export const nullableUuidSchema = z.string().uuid().nullable().optional();

export const nullableTextSchema = z.string().trim().min(1).nullable().optional();

export const nullableEmailSchema = z.string().trim().email().nullable().optional();

export const nullableDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();
