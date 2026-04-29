import bcrypt from 'bcrypt';
import {
  type AuthUserDto,
  type AuthenticatedAuthResponseDto,
  type LoginRequestDto,
  type LoginOrganizationSelectionRequiredResponseDto,
  type LoginResponseDto,
  OrganizationUserRole,
  type RegisterRequestDto,
  type RegisterResponseDto,
  type SelectableOrganizationMembershipDto,
  type SelectOrganizationRequestDto,
  type SelectOrganizationResponseDto,
  UserStatus,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import {
  AuthRepository,
  OrganizationUsersRepository,
  OrganizationsRepository,
  UsersRepository,
} from '../repositories/index.js';
import { db } from '../shared/db/index.js';
import {
  signAccessToken,
  signOrganizationSelectionToken,
  verifyOrganizationSelectionToken,
} from '../shared/utils/index.js';
import type {
  OrganizationUserRecord,
  PatientProfileRecord,
  UserRecord,
} from '../types/entities/index.js';

const PASSWORD_SALT_ROUNDS = 12;
const DEFAULT_REGISTRATION_ORGANIZATION_NAME = 'Zdravstvo';
const DEFAULT_REGISTRATION_ORGANIZATION_TIMEZONE = 'Europe/Zagreb';

interface DatabaseErrorLike {
  code?: string;
  message?: string;
}

const isDatabaseErrorLike = (error: unknown): error is DatabaseErrorLike => {
  return typeof error === 'object' && error !== null;
};

const normalizeOptionalString = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeRegistrationInput = (input: RegisterRequestDto): RegisterRequestDto => {
  return {
    organizationId: input.organizationId,
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password: input.password,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    dateOfBirth: input.dateOfBirth ?? null,
    oib: normalizeOptionalString(input.oib),
    address: normalizeOptionalString(input.address),
    emergencyContactName: normalizeOptionalString(input.emergencyContactName),
    emergencyContactPhone: normalizeOptionalString(input.emergencyContactPhone),
  };
};

const normalizeLoginIdentifier = (value: string): string => {
  const trimmedValue = value.trim();

  return trimmedValue.includes('@') ? trimmedValue.toLowerCase() : trimmedValue;
};

const mapAuthUser = (user: UserRecord, profile: PatientProfileRecord | null): AuthUserDto => {
  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    oib: profile?.oib ?? null,
    address: profile?.address ?? null,
    emergencyContactName: profile?.emergencyContactName ?? null,
    emergencyContactPhone: profile?.emergencyContactPhone ?? null,
  };
};

const mapDuplicateDatabaseError = (error: DatabaseErrorLike): AppError | null => {
  if (error.code !== 'ER_DUP_ENTRY') {
    return null;
  }

  const message = error.message ?? '';

  if (message.includes('uq_users_email')) {
    return AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email is already registered.');
  }

  if (message.includes('uq_users_phone')) {
    return AppError.conflict('PHONE_ALREADY_EXISTS', 'Phone is already registered.');
  }

  if (message.includes('uq_patient_oib')) {
    return AppError.conflict('OIB_ALREADY_EXISTS', 'OIB is already registered.');
  }

  return AppError.conflict(
    'REGISTRATION_CONFLICT',
    'Registration could not be completed because the account already exists.',
  );
};

const resolveRegistrationOrganizationId = async (repository: AuthRepository): Promise<string> => {
  const existingOrganizationId = await repository.findDefaultOrganizationId();

  if (existingOrganizationId) {
    return existingOrganizationId;
  }

  return repository.createOrganization({
    name: DEFAULT_REGISTRATION_ORGANIZATION_NAME,
    timezone: DEFAULT_REGISTRATION_ORGANIZATION_TIMEZONE,
  });
};

const mapAuthenticatedResponse = (
  user: UserRecord,
  profile: PatientProfileRecord | null,
  membership: OrganizationUserRecord,
): AuthenticatedAuthResponseDto => {
  const accessToken = signAccessToken({
    sub: user.id,
    organizationId: membership.organizationId,
    orgUserId: membership.id,
    role: membership.role,
  });

  return {
    authenticated: true,
    requiresOrganizationSelection: false,
    accessToken,
    user: mapAuthUser(user, profile),
    organizationId: membership.organizationId,
    orgUserId: membership.id,
    role: membership.role,
  };
};

const mapSelectableMemberships = async (
  memberships: readonly OrganizationUserRecord[],
): Promise<SelectableOrganizationMembershipDto[]> => {
  const organizationRepository = new OrganizationsRepository(db);
  const organizations = await organizationRepository.findMinimalByIds(
    memberships.map((membership) => membership.organizationId),
  );
  const organizationsById = new Map(
    organizations.map((organization) => [organization.id, organization]),
  );

  return memberships.map((membership) => {
    const organization = organizationsById.get(membership.organizationId);

    if (!organization) {
      throw AppError.unauthorized('Account is not allowed to sign in.');
    }

    return {
      organizationId: membership.organizationId,
      organizationName: organization.name,
      orgUserId: membership.id,
      role: membership.role,
    };
  });
};

export class AuthService {
  public async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const identifier = normalizeLoginIdentifier(payload.identifier);
    const invalidCredentialsError = AppError.unauthorized('Invalid email/phone or password.');
    const usersRepository = new UsersRepository(db);
    const organizationUsersRepository = new OrganizationUsersRepository(db);
    const authRepository = new AuthRepository(db);
    const user = await usersRepository.findByEmailOrPhone(identifier);

    if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw invalidCredentialsError;
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    const memberships = await organizationUsersRepository.findActiveMembershipsByUserId(user.id);

    if (memberships.length === 0) {
      throw AppError.unauthorized('Account is not allowed to sign in.');
    }

    const patientProfile = await authRepository.findPatientProfileByUserId(user.id);

    if (memberships.length === 1) {
      return mapAuthenticatedResponse(user, patientProfile, memberships[0]);
    }

    return {
      authenticated: false,
      requiresOrganizationSelection: true,
      selectionToken: signOrganizationSelectionToken({
        sub: user.id,
      }),
      user: mapAuthUser(user, patientProfile),
      memberships: await mapSelectableMemberships(memberships),
    };
  }

  public async selectOrganization(
    payload: SelectOrganizationRequestDto,
  ): Promise<SelectOrganizationResponseDto> {
    const claims = verifyOrganizationSelectionToken(payload.selectionToken);
    const usersRepository = new UsersRepository(db);
    const organizationUsersRepository = new OrganizationUsersRepository(db);
    const authRepository = new AuthRepository(db);

    const [user, membership] = await Promise.all([
      usersRepository.findById(claims.sub),
      organizationUsersRepository.findActiveMembershipByUserIdAndOrganizationId(
        claims.sub,
        payload.organizationId,
      ),
    ]);

    if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw AppError.unauthorized('Authentication is invalid or no longer active.');
    }

    if (!membership) {
      throw AppError.forbidden('Organization is not available for this login.');
    }

    const patientProfile = await authRepository.findPatientProfileByUserId(user.id);

    return mapAuthenticatedResponse(user, patientProfile, membership);
  }

  public async register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    const input = normalizeRegistrationInput(payload);

    const existingRepository = new AuthRepository(db);

    const [existingUserByEmail, existingUserByPhone] = await Promise.all([
      existingRepository.findUserByEmail(input.email),
      existingRepository.findUserByPhone(input.phone),
    ]);

    if (existingUserByEmail) {
      throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'Email is already registered.');
    }

    if (existingUserByPhone) {
      throw AppError.conflict('PHONE_ALREADY_EXISTS', 'Phone is already registered.');
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    try {
      return await db.transaction(async (transaction) => {
        const repository = new AuthRepository(transaction);
        const organizationsRepository = new OrganizationsRepository(transaction);
        const organizationId =
          input.organizationId ?? (await resolveRegistrationOrganizationId(repository));

        if (input.organizationId) {
          const organization = await organizationsRepository.findById(input.organizationId);

          if (!organization) {
            throw AppError.notFound('Organization not found.');
          }
        }

        const user = await repository.createUser({
          email: input.email,
          phone: input.phone,
          passwordHash,
          status: UserStatus.ACTIVE,
        });

        const patientProfile = await repository.createPatientProfile({
          userId: user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth ?? null,
          oib: input.oib ?? null,
          address: input.address ?? null,
          emergencyContactName: input.emergencyContactName ?? null,
          emergencyContactPhone: input.emergencyContactPhone ?? null,
        });

        await repository.createOrganizationUser({
          organizationId,
          userId: user.id,
          role: OrganizationUserRole.PATIENT,
          isActive: true,
        });

        return {
          user: mapAuthUser(user, patientProfile),
          organizationId,
          role: OrganizationUserRole.PATIENT,
        };
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (isDatabaseErrorLike(error)) {
        const conflictError = mapDuplicateDatabaseError(error);

        if (conflictError) {
          throw conflictError;
        }
      }

      throw AppError.internal('Registration failed. Please try again later.');
    }
  }
}

export const authService = new AuthService();
