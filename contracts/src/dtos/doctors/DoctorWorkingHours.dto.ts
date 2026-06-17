import { z } from "zod";

const timeStringSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/);

export interface DoctorWorkingHourResponseDto {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface DoctorWorkingHoursResponseDto {
  workingHours: DoctorWorkingHourResponseDto[];
}

export const doctorWorkingHourInputSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
    isOff: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.isOff === true) {
      return;
    }

    if (!value.startTime) {
      context.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Start time is required.",
      });
    }

    if (!value.endTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time is required.",
      });
    }
  });

export const replaceDoctorWorkingHoursRequestSchema = z.object({
  workingHours: z.array(doctorWorkingHourInputSchema).max(7),
});

export type DoctorWorkingHourInputDto = z.infer<
  typeof doctorWorkingHourInputSchema
>;
export type ReplaceDoctorWorkingHoursRequestDto = z.infer<
  typeof replaceDoctorWorkingHoursRequestSchema
>;
