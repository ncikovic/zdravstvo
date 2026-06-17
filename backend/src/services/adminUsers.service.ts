import type {
  AdminUserListQueryDto,
  AdminUserListResponseDto,
  AdminUserResponseDto,
  OrganizationUserRole,
  UpdateAdminUserRequestDto,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import {
  AdminUsersRepository,
  type AdminUserRecord,
  type FindAdminUsersInput,
  type UpdateAdminUserRecordInput,
} from '../repositories/index.js';
import { db } from '../shared/db/index.js';

const PAGE_SIZE = 20;

const buildFirstName = (record: AdminUserRecord): string | null => {
  return record.patientFirstName ?? record.doctorFirstName;
};

const buildLastName = (record: AdminUserRecord): string | null => {
  return record.patientLastName ?? record.doctorLastName;
};

const buildDisplayName = (record: AdminUserRecord): string | null => {
  const firstName = buildFirstName(record);
  const lastName = buildLastName(record);

  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return null;
};

const mapAdminUserResponse = (record: AdminUserRecord): AdminUserResponseDto => ({
  orgUserId: record.orgUserId,
  userId: record.userId,
  email: record.email,
  phone: record.phone,
  userStatus: record.userStatus,
  role: record.role,
  isActive: record.isActive,
  organizationId: record.organizationId,
  organizationName: record.organizationName,
  displayName: buildDisplayName(record),
  firstName: buildFirstName(record),
  lastName: buildLastName(record),
});

const normalizeOptionalString = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeRequiredUpdateString = (value: string | undefined): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const createAdminUserNotFoundError = (): AppError => {
  return AppError.notFound('Organization user not found.');
};

export class AdminUsersService {
  public constructor(
    private readonly adminUsersRepository: AdminUsersRepository = new AdminUsersRepository(db),
  ) {}

  public async list(query: AdminUserListQueryDto): Promise<AdminUserListResponseDto> {
    const page = query.page ?? 1;
    const input: FindAdminUsersInput = {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      organizationId: query.organizationId,
      role: query.role as OrganizationUserRole | undefined,
      search: query.search,
    };

    const [users, totalItems] = await Promise.all([
      this.adminUsersRepository.findMany(input),
      this.adminUsersRepository.countMany(input),
    ]);

    return {
      users: users.map(mapAdminUserResponse),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
      },
    };
  }

  public async getByOrgUserId(orgUserId: string): Promise<AdminUserResponseDto> {
    const user = await this.adminUsersRepository.findByOrgUserId(orgUserId);

    if (!user) {
      throw createAdminUserNotFoundError();
    }

    return mapAdminUserResponse(user);
  }

  public async update(
    orgUserId: string,
    payload: UpdateAdminUserRequestDto,
  ): Promise<AdminUserResponseDto> {
    const existing = await this.adminUsersRepository.findByOrgUserId(orgUserId);

    if (!existing) {
      throw createAdminUserNotFoundError();
    }

    const email = normalizeOptionalString(payload.email);
    const phone = normalizeOptionalString(payload.phone);
    const firstName = normalizeRequiredUpdateString(payload.firstName);
    const lastName = normalizeRequiredUpdateString(payload.lastName);
    const resolvedEmail = email === undefined ? existing.email : email;
    const resolvedPhone = phone === undefined ? existing.phone : phone;

    if (!resolvedEmail && !resolvedPhone) {
      throw AppError.badRequest(
        'ADMIN_USER_CONTACT_REQUIRED',
        'User must have at least one contact field.',
      );
    }

    if (email !== undefined && email !== null) {
      const emailExists = await this.adminUsersRepository.emailExistsForAnotherUser(
        email,
        existing.userId,
      );

      if (emailExists) {
        throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email address already exists.');
      }
    }

    if (phone !== undefined && phone !== null) {
      const phoneExists = await this.adminUsersRepository.phoneExistsForAnotherUser(
        phone,
        existing.userId,
      );

      if (phoneExists) {
        throw AppError.conflict('PHONE_ALREADY_EXISTS', 'Phone number already exists.');
      }
    }

    const updateInput: UpdateAdminUserRecordInput = {
      email,
      phone,
      role: payload.role,
      firstName,
      lastName,
    };
    const updateValues = Object.fromEntries(
      Object.entries(updateInput).filter(([, value]) => value !== undefined),
    ) as UpdateAdminUserRecordInput;

    if (Object.keys(updateValues).length === 0) {
      throw AppError.badRequest(
        'ADMIN_USER_UPDATE_EMPTY',
        'At least one user field must be provided.',
      );
    }

    await db.transaction(async (trx) => {
      await new AdminUsersRepository(trx).update(orgUserId, updateValues);
    });

    return this.getByOrgUserId(orgUserId);
  }

  public async activate(orgUserId: string): Promise<void> {
    const wasActivated = await this.adminUsersRepository.activate(orgUserId);

    if (!wasActivated) {
      throw createAdminUserNotFoundError();
    }
  }

  public async deactivate(orgUserId: string): Promise<void> {
    const wasDeactivated = await this.adminUsersRepository.deactivate(orgUserId);

    if (!wasDeactivated) {
      throw createAdminUserNotFoundError();
    }
  }
}

export const adminUsersService = new AdminUsersService();
