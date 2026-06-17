import { z } from 'zod';

import { OrganizationUserRole, UserStatus } from '../../enums/index.js';

export interface AdminUserResponseDto {
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

export interface AdminUserListPaginationDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminUserListResponseDto {
  users: AdminUserResponseDto[];
  pagination: AdminUserListPaginationDto;
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

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  organizationId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  role: z.preprocess(
    emptyStringToUndefined,
    z.nativeEnum(OrganizationUserRole).optional(),
  ),
  search: z.preprocess(emptyStringToUndefined, z.string().trim().max(120).optional()),
});

export type AdminUserListQueryDto = z.infer<typeof adminUserListQuerySchema>;

export const adminOrgUserIdParamsSchema = z.strictObject({
  orgUserId: z.string().uuid(),
});

export type AdminOrgUserIdParamsDto = z.infer<typeof adminOrgUserIdParamsSchema>;

export const updateAdminUserRequestSchema = z.strictObject({
  email: z.preprocess(
    emptyStringToNull,
    z.string().trim().email().max(255).nullable().optional(),
  ),
  phone: z.preprocess(emptyStringToNull, z.string().trim().max(60).nullable().optional()),
  role: z.nativeEnum(OrganizationUserRole).optional(),
  firstName: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(120).optional()),
  lastName: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(120).optional()),
});

export type UpdateAdminUserRequestDto = z.infer<typeof updateAdminUserRequestSchema>;
