import { z } from "zod";

const emptyStringToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const queryStringToBoolean = (value: unknown): unknown => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return emptyStringToUndefined(value);
};

export const appointmentTypeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.preprocess(emptyStringToUndefined, z.string().trim().max(120).optional()),
  isActive: z.preprocess(
    queryStringToBoolean,
    z.boolean().optional(),
  ),
  durationMinutes: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
});

export type AppointmentTypeListQueryDto = z.infer<typeof appointmentTypeListQuerySchema>;
