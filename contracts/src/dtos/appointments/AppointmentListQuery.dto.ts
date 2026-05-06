import { z } from "zod";

import { appointmentStatusSchema } from "./Appointment.dto.js";

export const appointmentListQuerySchema = z
  .object({
    startAt: z.iso.datetime().optional(),
    endAt: z.iso.datetime().optional(),
    doctorId: z.string().uuid().optional(),
    patientId: z.string().uuid().optional(),
    status: appointmentStatusSchema.optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
  })
  .refine(
    (payload) =>
      !payload.startAt || !payload.endAt || payload.startAt < payload.endAt,
    {
      path: ["endAt"],
      message: "End date-time must be after start date-time.",
    },
  );

export type AppointmentListQueryDto = z.infer<
  typeof appointmentListQuerySchema
>;
