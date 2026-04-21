import { z } from 'zod';

import { OrganizationUserRole } from '../enums/index.js';

export const registerRequestSchema = z.object({
  email: z.email(),
  phone: z.string().trim().min(1).max(60),
  password: z.string().min(8).max(255),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  dateOfBirth: z.iso.date().nullable().optional(),
  oib: z.string().trim().min(1).max(32).nullable().optional(),
  address: z.string().trim().min(1).max(255).nullable().optional(),
  emergencyContactName: z.string().trim().min(1).max(120).nullable().optional(),
  emergencyContactPhone: z.string().trim().min(1).max(60).nullable().optional(),
});

export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;

export interface RegisterResponseDto {
  userId: string;
  organizationId: string;
  role: OrganizationUserRole.PATIENT;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}
