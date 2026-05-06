import { z } from "zod";

const optionalNullableText = (maxLength: number) =>
  z.string().trim().max(maxLength).nullable().optional();

export const updateAppointmentScheduleRequestSchema = z
  .strictObject({
    doctorId: z.string().uuid().optional(),
    appointmentTypeId: z.string().uuid().optional(),
    startAt: z.iso.datetime().optional(),
    endAt: z.iso.datetime().optional(),
    notes: optionalNullableText(5000),
  })
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: "At least one appointment schedule field must be provided.",
    },
  );

export type UpdateAppointmentScheduleRequestDto = z.infer<
  typeof updateAppointmentScheduleRequestSchema
>;
