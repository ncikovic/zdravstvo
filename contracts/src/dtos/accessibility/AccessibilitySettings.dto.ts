import { z } from "zod";

export interface AccessibilitySettingsDto {
  userId: string;
  fontScale: number;
  highContrast: boolean;
  simpleMode: boolean;
  voiceConfirmations: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export const updateAccessibilitySettingsRequestSchema = z
  .object({
    fontScale: z.number().min(0.8).max(1.5).optional(),
    highContrast: z.boolean().optional(),
    simpleMode: z.boolean().optional(),
    voiceConfirmations: z.boolean().optional(),
  })
  .refine((payload) => Object.values(payload).some((value) => value !== undefined), {
    message: "At least one accessibility setting must be provided.",
  });

export type UpdateAccessibilitySettingsRequestDto = z.infer<
  typeof updateAccessibilitySettingsRequestSchema
>;
