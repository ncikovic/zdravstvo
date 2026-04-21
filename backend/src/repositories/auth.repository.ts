import { OrganizationUserRole, UserStatus } from '@zdravstvo/contracts';
import { v4 as uuidv4 } from 'uuid';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';
import type {
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

  public async findDefaultOrganizationId(): Promise<string | null> {
    const row = await this.executor<{ id: Buffer }>('organizations')
      .select('id')
      .orderBy('created_at', 'asc')
      .first();

    return row ? bufferToUuid(row.id) : null;
  }
}
