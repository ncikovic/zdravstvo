import {
  type CreateManagerUserRequestDto,
  type ManagerUserListQueryDto,
  type ManagerUserListResponseDto,
  type ManagerUserResponseDto,
  OrganizationUserRole,
  type UpdateManagerUserRequestDto,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import {
  ManagerUsersRepository,
  type ManagerUserRecord,
  type UpdateManagerUserRecordInput,
} from '../repositories/index.js';
import type { AuthenticatedRequestContext } from '../shared/context/index.js';
import { db } from '../shared/db/index.js';

const PAGE_SIZE = 20;

type ManagerUsersRequestContext = Pick<AuthenticatedRequestContext, 'organizationId'>;

interface DatabaseErrorLike {
  code?: string;
  message?: string;
}

const buildFirstName = (record: ManagerUserRecord): string | null => {
  if (record.role === OrganizationUserRole.DOCTOR) {
    return record.doctorFirstName ?? record.patientFirstName;
  }

  if (record.role === OrganizationUserRole.PATIENT) {
    return record.patientFirstName ?? record.doctorFirstName;
  }

  return record.patientFirstName ?? record.doctorFirstName;
};

const buildLastName = (record: ManagerUserRecord): string | null => {
  if (record.role === OrganizationUserRole.DOCTOR) {
    return record.doctorLastName ?? record.patientLastName;
  }

  if (record.role === OrganizationUserRole.PATIENT) {
    return record.patientLastName ?? record.doctorLastName;
  }

  return record.patientLastName ?? record.doctorLastName;
};

const buildDisplayName = (record: ManagerUserRecord): string | null => {
  const firstName = buildFirstName(record);
  const lastName = buildLastName(record);

  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return null;
};

const mapManagerUserResponse = (record: ManagerUserRecord): ManagerUserResponseDto => ({
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

const createManagerUserNotFoundError = (): AppError => {
  return AppError.notFound('Organization user not found.');
};

const assertOrganizationContext = (context: ManagerUsersRequestContext): void => {
  if (!context.organizationId) {
    throw AppError.forbidden();
  }
};

const isProfileRole = (role: OrganizationUserRole): boolean => {
  return role === OrganizationUserRole.DOCTOR || role === OrganizationUserRole.PATIENT;
};

const hasProfileForRole = (record: ManagerUserRecord, role: OrganizationUserRole): boolean => {
  if (role === OrganizationUserRole.DOCTOR) {
    return record.doctorFirstName !== null || record.doctorLastName !== null;
  }

  if (role === OrganizationUserRole.PATIENT) {
    return record.patientFirstName !== null || record.patientLastName !== null;
  }

  return true;
};

const assertContactExists = (email: string | null | undefined, phone: string | null | undefined): void => {
  if (!email && !phone) {
    throw AppError.badRequest(
      'MANAGER_USER_CONTACT_REQUIRED',
      'User must have at least one contact field.',
    );
  }
};

const assertProfileName = (
  role: OrganizationUserRole,
  firstName: string | undefined,
  lastName: string | undefined,
): void => {
  if (!isProfileRole(role)) {
    return;
  }

  if (!firstName || !lastName) {
    throw AppError.badRequest(
      'MANAGER_USER_PROFILE_NAME_REQUIRED',
      'First name and last name are required for doctor and patient users.',
    );
  }
};

const isDatabaseErrorLike = (error: unknown): error is DatabaseErrorLike => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

const mapManagerUserDatabaseError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (!isDatabaseErrorLike(error) || error.code !== 'ER_DUP_ENTRY') {
    return AppError.internal('Manager user changes could not be saved.');
  }

  const message = error.message ?? '';

  if (message.includes('uq_users_email')) {
    return AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email address already exists.');
  }

  if (message.includes('uq_users_phone')) {
    return AppError.conflict('PHONE_ALREADY_EXISTS', 'Phone number already exists.');
  }

  if (message.includes('uq_org_user')) {
    return AppError.conflict(
      'MANAGER_USER_ALREADY_IN_ORGANIZATION',
      'User already belongs to this organization.',
    );
  }

  return AppError.conflict(
    'MANAGER_USER_CONFLICT',
    'User changes conflict with existing records.',
  );
};

export class ManagerUsersService {
  public constructor(
    private readonly managerUsersRepository: ManagerUsersRepository = new ManagerUsersRepository(db),
  ) {}

  public async list(
    context: ManagerUsersRequestContext,
    query: ManagerUserListQueryDto,
  ): Promise<ManagerUserListResponseDto> {
    assertOrganizationContext(context);

    const page = query.page ?? 1;
    const input = {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      organizationId: context.organizationId,
      role: query.role,
      search: query.search,
    };

    const [users, totalItems] = await Promise.all([
      this.managerUsersRepository.findMany(input),
      this.managerUsersRepository.countMany(input),
    ]);

    return {
      users: users.map(mapManagerUserResponse),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
      },
    };
  }

  public async getByOrgUserId(
    context: ManagerUsersRequestContext,
    orgUserId: string,
  ): Promise<ManagerUserResponseDto> {
    assertOrganizationContext(context);

    const user = await this.managerUsersRepository.findByOrgUserIdInOrganization(
      orgUserId,
      context.organizationId,
    );

    if (!user) {
      throw createManagerUserNotFoundError();
    }

    return mapManagerUserResponse(user);
  }

  public async create(
    context: ManagerUsersRequestContext,
    payload: CreateManagerUserRequestDto,
  ): Promise<ManagerUserResponseDto> {
    assertOrganizationContext(context);

    const email = normalizeOptionalString(payload.email) ?? null;
    const phone = normalizeOptionalString(payload.phone) ?? null;
    const firstName = normalizeRequiredUpdateString(payload.firstName);
    const lastName = normalizeRequiredUpdateString(payload.lastName);

    assertContactExists(email, phone);
    assertProfileName(payload.role, firstName, lastName);

    if (email && (await this.managerUsersRepository.emailExists(email))) {
      throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email address already exists.');
    }

    if (phone && (await this.managerUsersRepository.phoneExists(phone))) {
      throw AppError.conflict('PHONE_ALREADY_EXISTS', 'Phone number already exists.');
    }

    try {
      const orgUserId = await db.transaction(async (trx) => {
        return new ManagerUsersRepository(trx).create({
          organizationId: context.organizationId,
          email,
          phone,
          role: payload.role,
          firstName,
          lastName,
        });
      });

      return this.getByOrgUserId(context, orgUserId);
    } catch (error: unknown) {
      throw mapManagerUserDatabaseError(error);
    }
  }

  public async update(
    context: ManagerUsersRequestContext,
    orgUserId: string,
    payload: UpdateManagerUserRequestDto,
  ): Promise<ManagerUserResponseDto> {
    assertOrganizationContext(context);

    const existing = await this.managerUsersRepository.findByOrgUserIdInOrganization(
      orgUserId,
      context.organizationId,
    );

    if (!existing) {
      throw createManagerUserNotFoundError();
    }

    const email = normalizeOptionalString(payload.email);
    const phone = normalizeOptionalString(payload.phone);
    const firstName = normalizeRequiredUpdateString(payload.firstName);
    const lastName = normalizeRequiredUpdateString(payload.lastName);
    const resolvedEmail = email === undefined ? existing.email : email;
    const resolvedPhone = phone === undefined ? existing.phone : phone;
    const targetRole = payload.role ?? existing.role;

    assertContactExists(resolvedEmail, resolvedPhone);

    if (!hasProfileForRole(existing, targetRole)) {
      assertProfileName(targetRole, firstName, lastName);
    }

    if (email !== undefined && email !== null) {
      const emailExists = await this.managerUsersRepository.emailExistsForAnotherUser(
        email,
        existing.userId,
      );

      if (emailExists) {
        throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email address already exists.');
      }
    }

    if (phone !== undefined && phone !== null) {
      const phoneExists = await this.managerUsersRepository.phoneExistsForAnotherUser(
        phone,
        existing.userId,
      );

      if (phoneExists) {
        throw AppError.conflict('PHONE_ALREADY_EXISTS', 'Phone number already exists.');
      }
    }

    const updateInput: UpdateManagerUserRecordInput = {
      email,
      phone,
      role: payload.role,
      firstName,
      lastName,
    };
    const updateValues = Object.fromEntries(
      Object.entries(updateInput).filter(([, value]) => value !== undefined),
    ) as UpdateManagerUserRecordInput;

    if (Object.keys(updateValues).length === 0) {
      throw AppError.badRequest(
        'MANAGER_USER_UPDATE_EMPTY',
        'At least one user field must be provided.',
      );
    }

    try {
      await db.transaction(async (trx) => {
        await new ManagerUsersRepository(trx).update(
          orgUserId,
          context.organizationId,
          updateValues,
        );
      });

      return this.getByOrgUserId(context, orgUserId);
    } catch (error: unknown) {
      throw mapManagerUserDatabaseError(error);
    }
  }

  public async activate(context: ManagerUsersRequestContext, orgUserId: string): Promise<void> {
    assertOrganizationContext(context);

    const wasActivated = await this.managerUsersRepository.activate(
      orgUserId,
      context.organizationId,
    );

    if (!wasActivated) {
      throw createManagerUserNotFoundError();
    }
  }

  public async deactivate(context: ManagerUsersRequestContext, orgUserId: string): Promise<void> {
    assertOrganizationContext(context);

    const wasDeactivated = await this.managerUsersRepository.deactivate(
      orgUserId,
      context.organizationId,
    );

    if (!wasDeactivated) {
      throw createManagerUserNotFoundError();
    }
  }
}

export const managerUsersService = new ManagerUsersService();
