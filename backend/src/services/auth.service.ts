import bcrypt from 'bcrypt';
import {
  OrganizationUserRole,
  type RegisterRequestDto,
  type RegisterResponseDto,
  UserStatus,
} from '@zdravstvo/contracts';

import { AppError } from '../errors/AppError.js';
import { AuthRepository } from '../repositories/index.js';
import { db } from '../shared/db/index.js';

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
          userId: user.id,
          organizationId,
          role: OrganizationUserRole.PATIENT,
          email: user.email,
          phone: user.phone,
          firstName: patientProfile.firstName,
          lastName: patientProfile.lastName,
          dateOfBirth: patientProfile.dateOfBirth,
          oib: patientProfile.oib,
          address: patientProfile.address,
          emergencyContactName: patientProfile.emergencyContactName,
          emergencyContactPhone: patientProfile.emergencyContactPhone,
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
