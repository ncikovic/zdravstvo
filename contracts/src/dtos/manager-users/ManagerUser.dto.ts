import { z } from 'zod';

import { OrganizationUserRole, UserStatus } from '../../enums/index.js';

export interface ManagerUserResponseDto {
  orgUserId: string;
  userId: string;
  email: string | null;
  phone: string | null;
  userStatus: UserStatus;
  role: OrganizationUserRole;
  isActive: boolean;
  organizationId: string;
  organizationName: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface ManagerUserListPaginationDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ManagerUserListResponseDto {
  users: ManagerUserResponseDto[];
  pagination: ManagerUserListPaginationDto;
}

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const emptyStringToNull = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const managerUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  role: z.preprocess(
    emptyStringToUndefined,
    z.nativeEnum(OrganizationUserRole).optional(),
  ),
  search: z.preprocess(emptyStringToUndefined, z.string().trim().max(120).optional()),
});

export type ManagerUserListQueryDto = z.infer<typeof managerUserListQuerySchema>;

export const managerOrgUserIdParamsSchema = z.strictObject({
  orgUserId: z.string().uuid(),
});

export type ManagerOrgUserIdParamsDto = z.infer<typeof managerOrgUserIdParamsSchema>;

export const createManagerUserRequestSchema = z.strictObject({
  email: z.preprocess(
    emptyStringToNull,
    z.string().trim().email().max(255).nullable().optional(),
  ),
  phone: z.preprocess(emptyStringToNull, z.string().trim().max(60).nullable().optional()),
  role: z.nativeEnum(OrganizationUserRole),
  firstName: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(120).optional()),
  lastName: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(120).optional()),
});

export type CreateManagerUserRequestDto = z.infer<typeof createManagerUserRequestSchema>;

export const updateManagerUserRequestSchema = z.strictObject({
  email: z.preprocess(
    emptyStringToNull,
    z.string().trim().email().max(255).nullable().optional(),
  ),
  phone: z.preprocess(emptyStringToNull, z.string().trim().max(60).nullable().optional()),
  role: z.nativeEnum(OrganizationUserRole).optional(),
  firstName: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(120).optional()),
  lastName: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(120).optional()),
});

export type UpdateManagerUserRequestDto = z.infer<typeof updateManagerUserRequestSchema>;
