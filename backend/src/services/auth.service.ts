import bcrypt from 'bcrypt';
import {
  type AuthUserDto,
  type LoginRequestDto,
  type LoginResponseDto,
  OrganizationUserRole,
  type RegisterRequestDto,
  type RegisterResponseDto,
  UserStatus,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import { AuthRepository } from '../repositories/index.js';
import { db } from '../shared/db/index.js';
import { signAccessToken } from '../shared/utils/index.js';

const PASSWORD_SALT_ROUNDS = 12;

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

const normalizeRegistrationInput = (
  input: RegisterRequestDto
): RegisterRequestDto => {
  return {
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

const mapAuthUser = (
  userId: string,
  email: string | null,
  phone: string | null,
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    oib: string | null;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  }
): AuthUserDto => {
  return {
    userId,
    email,
    phone,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
    oib: profile.oib,
    address: profile.address,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone,
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

  return AppError.conflict(
    'REGISTRATION_CONFLICT',
    'Registration could not be completed because the account already exists.'
  );
};

export class AuthService {
  public async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const identifier = normalizeLoginIdentifier(payload.emailOrPhone);
    const invalidCredentialsError = AppError.unauthorized(
      'Invalid email/phone or password.'
    );
    const repository = new AuthRepository(db);
    const user = await repository.findUserByEmailOrPhone(identifier);

    if (!user || !user.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw invalidCredentialsError;
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isPasswordValid) {
      throw invalidCredentialsError;
    }

    const membership = await repository.findFirstActiveOrganizationMembership(user.id);

    if (!membership || !membership.isActive) {
      throw AppError.unauthorized('Account is not allowed to sign in.');
    }

    const patientProfile = await repository.findPatientProfileByUserId(user.id);

    if (!patientProfile) {
      throw AppError.unauthorized('Account is not allowed to sign in.');
    }

    const accessToken = signAccessToken({
      sub: user.id,
      organizationId: membership.organizationId,
      role: membership.role,
    });

    return {
      accessToken,
      user: mapAuthUser(user.id, user.email, user.phone, patientProfile),
      organizationId: membership.organizationId,
      role: membership.role,
    };
  }

  public async register(
    payload: RegisterRequestDto
  ): Promise<RegisterResponseDto> {
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
        const organizationId = await repository.findDefaultOrganizationId();

        if (!organizationId) {
          throw AppError.internal('Registration is not available at the moment.');
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
          user: mapAuthUser(user.id, user.email, user.phone, patientProfile),
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
