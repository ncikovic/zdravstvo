import { z } from "zod";

const optionalNullableString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).nullable().optional();

export interface DoctorTimeOffResponseDto {
  id: string;
  doctorId: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  createdAt: string;
}

export interface DoctorTimeOffListResponseDto {
  timeOff: DoctorTimeOffResponseDto[];
}

export const createDoctorTimeOffRequestSchema = z.object({
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  reason: optionalNullableString(255),
});

export type CreateDoctorTimeOffRequestDto = z.infer<
  typeof createDoctorTimeOffRequestSchema
>;
