import { OrganizationUserRole, UserStatus } from '@zdravstvo/contracts';
import { v4 as uuidv4 } from 'uuid';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';
import type {
  AuthenticatedUserRecord,
  LoginMembershipRecord,
  OrganizationUserRecord,
  PatientProfileRecord,
  UserRecord,
} from '../types/entities/index.js';

interface UserRow {
  id: Buffer;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  status: UserStatus;
}

interface PatientProfileRow {
  user_id: Buffer;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  oib: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

interface OrganizationUserRow {
  id: Buffer;
  organization_id: Buffer;
  user_id: Buffer;
  role: OrganizationUserRole;
  is_active: number | boolean;
}

interface LoginMembershipRow {
  organization_id: Buffer;
  role: OrganizationUserRole;
  is_active: number | boolean;
}

interface AuthenticatedUserRow {
  user_id: Buffer;
  organization_user_id: Buffer;
  organization_id: Buffer;
  role: OrganizationUserRole;
  is_active: number | boolean;
  email: string | null;
  phone: string | null;
  status: UserStatus;
}

export interface CreateUserInput {
  email: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
}

export interface CreatePatientProfileInput {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface CreateOrganizationUserInput {
  organizationId: string;
  userId: string;
  role: OrganizationUserRole;
  isActive: boolean;
}

const mapUserRecord = (row: UserRow): UserRecord => {
  return {
    id: bufferToUuid(row.id),
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    status: row.status,
  };
};

const mapPatientProfileRecord = (
  row: PatientProfileRow
): PatientProfileRecord => {
  return {
    userId: bufferToUuid(row.user_id),
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    oib: row.oib,
    address: row.address,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
  };
};

const mapOrganizationUserRecord = (
  row: OrganizationUserRow
): OrganizationUserRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    userId: bufferToUuid(row.user_id),
    role: row.role,
    isActive: Boolean(row.is_active),
  };
};

const mapLoginMembershipRecord = (
  row: LoginMembershipRow
): LoginMembershipRecord => {
  return {
    organizationId: bufferToUuid(row.organization_id),
    role: row.role,
    isActive: Boolean(row.is_active),
  };
};

const mapAuthenticatedUserRecord = (
  row: AuthenticatedUserRow
): AuthenticatedUserRecord => {
  return {
    userId: bufferToUuid(row.user_id),
    organizationUserId: bufferToUuid(row.organization_user_id),
    organizationId: bufferToUuid(row.organization_id),
    role: row.role,
    isActive: Boolean(row.is_active),
    email: row.email,
    phone: row.phone,
    status: row.status,
  };
};

export class AuthRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.executor<UserRow>('users')
      .select('id', 'email', 'phone', 'password_hash', 'status')
      .where({ email })
      .first();

    return row ? mapUserRecord(row) : null;
  }

  public async findUserByPhone(phone: string): Promise<UserRecord | null> {
    const row = await this.executor<UserRow>('users')
      .select('id', 'email', 'phone', 'password_hash', 'status')
      .where({ phone })
      .first();

    return row ? mapUserRecord(row) : null;
  }

  public async findUserByEmailOrPhone(
    emailOrPhone: string
  ): Promise<UserRecord | null> {
    const row = await this.executor<UserRow>('users')
      .select('id', 'email', 'phone', 'password_hash', 'status')
      .where({ email: emailOrPhone })
      .orWhere({ phone: emailOrPhone })
      .first();

    return row ? mapUserRecord(row) : null;
  }

  public async createUser(input: CreateUserInput): Promise<UserRecord> {
    const id = uuidv4();

    await this.executor('users').insert({
      id: uuidToBuffer(id),
      email: input.email,
      phone: input.phone,
      password_hash: input.passwordHash,
      status: input.status,
    });

    return {
      id,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      status: input.status,
    };
  }

  public async createPatientProfile(
    input: CreatePatientProfileInput
  ): Promise<PatientProfileRecord> {
    await this.executor('patient_profiles').insert({
      user_id: uuidToBuffer(input.userId),
      first_name: input.firstName,
      last_name: input.lastName,
      date_of_birth: input.dateOfBirth,
      oib: input.oib,
      address: input.address,
      emergency_contact_name: input.emergencyContactName,
      emergency_contact_phone: input.emergencyContactPhone,
    });

    const row = await this.executor<PatientProfileRow>('patient_profiles')
      .select(
        'user_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'oib',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone'
      )
      .where({ user_id: uuidToBuffer(input.userId) })
      .first();

    if (!row) {
      throw new Error('Patient profile creation failed.');
    }

    return mapPatientProfileRecord(row);
  }

  public async createOrganizationUser(
    input: CreateOrganizationUserInput
  ): Promise<OrganizationUserRecord> {
    const id = uuidv4();

    await this.executor('organization_users').insert({
      id: uuidToBuffer(id),
      organization_id: uuidToBuffer(input.organizationId),
      user_id: uuidToBuffer(input.userId),
      role: input.role,
      is_active: input.isActive,
    });

    return {
      id,
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role,
      isActive: input.isActive,
    };
  }

  public async findPatientProfileByUserId(
    userId: string
  ): Promise<PatientProfileRecord | null> {
    const row = await this.executor<PatientProfileRow>('patient_profiles')
      .select(
        'user_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'oib',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone'
      )
      .where({ user_id: uuidToBuffer(userId) })
      .first();

    return row ? mapPatientProfileRecord(row) : null;
  }

  public async findFirstActiveOrganizationMembership(
    userId: string
  ): Promise<LoginMembershipRecord | null> {
    const row = await this.executor<LoginMembershipRow>('organization_users')
      .select('organization_id', 'role', 'is_active')
      .where('user_id', uuidToBuffer(userId))
      .andWhere('is_active', 1)
      .orderBy('created_at', 'asc')
      .first();

    return row ? mapLoginMembershipRecord(row) : null;
  }

  public async findAuthenticatedContext(
    userId: string,
    organizationId: string
  ): Promise<AuthenticatedUserRecord | null> {
    const row = await this.executor<AuthenticatedUserRow>(
      'organization_users as organizationUser'
    )
      .innerJoin('users as user', 'user.id', 'organizationUser.user_id')
      .select(
        'organizationUser.user_id as user_id',
        'organizationUser.id as organization_user_id',
        'organizationUser.organization_id as organization_id',
        'organizationUser.role as role',
        'organizationUser.is_active as is_active',
        'user.email as email',
        'user.phone as phone',
        'user.status as status'
      )
      .where('organizationUser.user_id', uuidToBuffer(userId))
      .andWhere('organizationUser.organization_id', uuidToBuffer(organizationId))
      .orderBy('organizationUser.created_at', 'asc')
      .first();

    return row ? mapAuthenticatedUserRecord(row) : null;
  }

  public async findDefaultOrganizationId(): Promise<string | null> {
    const row = await this.executor<{ id: Buffer }>('organizations')
      .select('id')
      .orderBy('created_at', 'asc')
      .first();

    return row ? bufferToUuid(row.id) : null;
  }
}
