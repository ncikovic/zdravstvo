import { z } from 'zod';

import { OrganizationUserRole } from '../enums/index.js';

export interface AuthUserDto {
  userId: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

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
  user: AuthUserDto;
  organizationId: string;
  role: OrganizationUserRole.PATIENT;
}

export const loginRequestSchema = z
  .object({
    identifier: z.string().trim().min(1).max(255).optional(),
    emailOrPhone: z.string().trim().min(1).max(255).optional(),
    password: z.string().min(1).max(255),
  })
  .transform(({ identifier, emailOrPhone, password }) => ({
    identifier: identifier ?? emailOrPhone ?? '',
    password,
  }))
  .pipe(
    z.object({
      identifier: z.string().trim().min(1).max(255),
      password: z.string().min(1).max(255),
    })
  );

export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

export interface SelectableOrganizationMembershipDto {
  organizationId: string;
  organizationName: string;
  orgUserId: string;
  role: OrganizationUserRole;
}

export interface AuthenticatedAuthResponseDto {
  authenticated: true;
  requiresOrganizationSelection: false;
  accessToken: string;
  user: AuthUserDto;
  organizationId: string;
  orgUserId: string;
  role: OrganizationUserRole;
}

export interface LoginOrganizationSelectionRequiredResponseDto {
  authenticated: false;
  requiresOrganizationSelection: true;
  selectionToken: string;
  user: AuthUserDto;
  memberships: SelectableOrganizationMembershipDto[];
}

export type LoginResponseDto =
  | AuthenticatedAuthResponseDto
  | LoginOrganizationSelectionRequiredResponseDto;

export const selectOrganizationRequestSchema = z.object({
  selectionToken: z.string().trim().min(1),
  organizationId: z.uuid(),
});

export type SelectOrganizationRequestDto = z.infer<
  typeof selectOrganizationRequestSchema
>;

export type SelectOrganizationResponseDto = AuthenticatedAuthResponseDto;
