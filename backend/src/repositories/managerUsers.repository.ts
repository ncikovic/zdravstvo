import { OrganizationUserRole, UserStatus } from '@zdravstvo/contracts';
import { v4 as uuidv4 } from 'uuid';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';

export interface ManagerUserRecord {
  orgUserId: string;
  userId: string;
  email: string | null;
  phone: string | null;
  userStatus: UserStatus;
  role: OrganizationUserRole;
  isActive: boolean;
  organizationId: string;
  organizationName: string;
  patientFirstName: string | null;
  patientLastName: string | null;
  doctorFirstName: string | null;
  doctorLastName: string | null;
}

export interface FindManagerUsersInput {
  organizationId: string;
  limit: number;
  offset: number;
  role?: OrganizationUserRole;
  search?: string;
}

export interface CreateManagerUserRecordInput {
  organizationId: string;
  email: string | null;
  phone: string | null;
  role: OrganizationUserRole;
  firstName?: string;
  lastName?: string;
}

export interface UpdateManagerUserRecordInput {
  email?: string | null;
  phone?: string | null;
  role?: OrganizationUserRole;
  firstName?: string;
  lastName?: string;
}

interface ManagerUserRow {
  org_user_id: Buffer;
  user_id: Buffer;
  email: string | null;
  phone: string | null;
  user_status: UserStatus;
  role: OrganizationUserRole;
  is_active: number | boolean;
  organization_id: Buffer;
  organization_name: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  doctor_first_name: string | null;
  doctor_last_name: string | null;
}

const mapManagerUserRecord = (row: ManagerUserRow): ManagerUserRecord => ({
  orgUserId: bufferToUuid(row.org_user_id),
  userId: bufferToUuid(row.user_id),
  email: row.email,
  phone: row.phone,
  userStatus: row.user_status,
  role: row.role,
  isActive: Boolean(row.is_active),
  organizationId: bufferToUuid(row.organization_id),
  organizationName: row.organization_name,
  patientFirstName: row.patient_first_name,
  patientLastName: row.patient_last_name,
  doctorFirstName: row.doctor_first_name,
  doctorLastName: row.doctor_last_name,
});

const applyFilters = (
  query: ReturnType<DatabaseExecutor['from']>,
  input: Pick<FindManagerUsersInput, 'organizationId' | 'role' | 'search'>,
): ReturnType<DatabaseExecutor['from']> => {
  let q = query.where('ou.organization_id', uuidToBuffer(input.organizationId));

  if (input.role) {
    q = q.where('ou.role', input.role);
  }

  if (input.search) {
    const pattern = `%${input.search}%`;
    q = q.where((builder) => {
      builder
        .where('u.email', 'like', pattern)
        .orWhere('u.phone', 'like', pattern)
        .orWhereRaw(
          "CONCAT(COALESCE(pp.first_name,''), ' ', COALESCE(pp.last_name,'')) like ?",
          [pattern],
        )
        .orWhereRaw(
          "CONCAT(COALESCE(dp.first_name,''), ' ', COALESCE(dp.last_name,'')) like ?",
          [pattern],
        );
    });
  }

  return q;
};

export class ManagerUsersRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findMany(input: FindManagerUsersInput): Promise<ManagerUserRecord[]> {
    const rows = await applyFilters(this.createManagerUsersQuery(), input)
      .orderBy('ou.created_at', 'asc')
      .limit(input.limit)
      .offset(input.offset);

    return (rows as ManagerUserRow[]).map(mapManagerUserRecord);
  }

  public async countMany(input: Pick<FindManagerUsersInput, 'organizationId' | 'role' | 'search'>): Promise<number> {
    const result = await applyFilters(
      this.executor('organization_users as ou')
        .join('users as u', 'u.id', 'ou.user_id')
        .join('organizations as o', 'o.id', 'ou.organization_id')
        .leftJoin('patient_profiles as pp', 'pp.user_id', 'ou.user_id')
        .leftJoin('doctor_profiles as dp', 'dp.user_id', 'ou.user_id')
        .count({ total: 'ou.id' }),
      input,
    ).first<{ total: number | string }>();

    return Number(result?.total ?? 0);
  }

  public async findByOrgUserIdInOrganization(
    orgUserId: string,
    organizationId: string,
  ): Promise<ManagerUserRecord | null> {
    const row = await this.createManagerUsersQuery()
      .where('ou.id', uuidToBuffer(orgUserId))
      .where('ou.organization_id', uuidToBuffer(organizationId))
      .first<ManagerUserRow>();

    return row ? mapManagerUserRecord(row) : null;
  }

  public async emailExists(email: string): Promise<boolean> {
    const row = await this.executor('users').where('email', email).first('id');
    return Boolean(row);
  }

  public async phoneExists(phone: string): Promise<boolean> {
    const row = await this.executor('users').where('phone', phone).first('id');
    return Boolean(row);
  }

  public async emailExistsForAnotherUser(email: string, userId: string): Promise<boolean> {
    const row = await this.executor('users')
      .where('email', email)
      .whereNot('id', uuidToBuffer(userId))
      .first('id');

    return Boolean(row);
  }

  public async phoneExistsForAnotherUser(phone: string, userId: string): Promise<boolean> {
    const row = await this.executor('users')
      .where('phone', phone)
      .whereNot('id', uuidToBuffer(userId))
      .first('id');

    return Boolean(row);
  }

  public async create(input: CreateManagerUserRecordInput): Promise<string> {
    const userId = uuidv4();
    const orgUserId = uuidv4();

    await this.executor('users').insert({
      id: uuidToBuffer(userId),
      email: input.email,
      phone: input.phone,
      password_hash: null,
      status: UserStatus.ACTIVE,
    });

    await this.executor('organization_users').insert({
      id: uuidToBuffer(orgUserId),
      organization_id: uuidToBuffer(input.organizationId),
      user_id: uuidToBuffer(userId),
      role: input.role,
      is_active: 1,
    });

    if (input.role === OrganizationUserRole.DOCTOR) {
      await this.createDoctorProfile(userId, input.firstName, input.lastName);
      await this.ensureOrganizationDoctor(input.organizationId, userId, true);
    }

    if (input.role === OrganizationUserRole.PATIENT) {
      await this.createPatientProfile(userId, input.firstName, input.lastName);
    }

    return orgUserId;
  }

  public async update(
    orgUserId: string,
    organizationId: string,
    input: UpdateManagerUserRecordInput,
  ): Promise<void> {
    const existing = await this.findByOrgUserIdInOrganization(orgUserId, organizationId);

    if (!existing) {
      return;
    }

    const userUpdates: Record<string, string | null> = {};
    if (input.email !== undefined) userUpdates.email = input.email;
    if (input.phone !== undefined) userUpdates.phone = input.phone;

    if (Object.keys(userUpdates).length > 0) {
      await this.executor('users')
        .where('id', uuidToBuffer(existing.userId))
        .update(userUpdates);
    }

    if (input.role !== undefined) {
      await this.executor('organization_users')
        .where('id', uuidToBuffer(orgUserId))
        .where('organization_id', uuidToBuffer(organizationId))
        .update({ role: input.role });
    }

    const targetRole = input.role ?? existing.role;
    await this.syncRoleSpecificRecords(existing, targetRole, input);
  }

  public async activate(orgUserId: string, organizationId: string): Promise<boolean> {
    return this.setActive(orgUserId, organizationId, true);
  }

  public async deactivate(orgUserId: string, organizationId: string): Promise<boolean> {
    return this.setActive(orgUserId, organizationId, false);
  }

  private createManagerUsersQuery(): ReturnType<DatabaseExecutor['from']> {
    return this.executor('organization_users as ou')
      .join('users as u', 'u.id', 'ou.user_id')
      .join('organizations as o', 'o.id', 'ou.organization_id')
      .leftJoin('patient_profiles as pp', 'pp.user_id', 'ou.user_id')
      .leftJoin('doctor_profiles as dp', 'dp.user_id', 'ou.user_id')
      .select(
        'ou.id as org_user_id',
        'ou.user_id',
        'u.email',
        'u.phone',
        'u.status as user_status',
        'ou.role',
        'ou.is_active',
        'ou.organization_id',
        'o.name as organization_name',
        'pp.first_name as patient_first_name',
        'pp.last_name as patient_last_name',
        'dp.first_name as doctor_first_name',
        'dp.last_name as doctor_last_name',
      );
  }

  private async setActive(
    orgUserId: string,
    organizationId: string,
    isActive: boolean,
  ): Promise<boolean> {
    const existing = await this.findByOrgUserIdInOrganization(orgUserId, organizationId);

    if (!existing) {
      return false;
    }

    const updated = await this.executor('organization_users')
      .where('id', uuidToBuffer(orgUserId))
      .where('organization_id', uuidToBuffer(organizationId))
      .update({ is_active: isActive ? 1 : 0 });

    if (existing.role === OrganizationUserRole.DOCTOR) {
      await this.executor('organization_doctors')
        .where('organization_id', uuidToBuffer(organizationId))
        .where('doctor_user_id', uuidToBuffer(existing.userId))
        .update({ is_active: isActive ? 1 : 0 });
    }

    return updated > 0;
  }

  private async syncRoleSpecificRecords(
    existing: ManagerUserRecord,
    targetRole: OrganizationUserRole,
    input: UpdateManagerUserRecordInput,
  ): Promise<void> {
    const profileUpdates: Record<string, string> = {};
    if (input.firstName !== undefined) profileUpdates.first_name = input.firstName;
    if (input.lastName !== undefined) profileUpdates.last_name = input.lastName;

    if (existing.role === OrganizationUserRole.DOCTOR && targetRole !== OrganizationUserRole.DOCTOR) {
      await this.executor('organization_doctors')
        .where('organization_id', uuidToBuffer(existing.organizationId))
        .where('doctor_user_id', uuidToBuffer(existing.userId))
        .update({ is_active: 0 });
    }

    if (targetRole === OrganizationUserRole.DOCTOR) {
      if (existing.doctorFirstName === null && existing.doctorLastName === null) {
        await this.createDoctorProfile(existing.userId, input.firstName, input.lastName);
      } else if (Object.keys(profileUpdates).length > 0) {
        await this.executor('doctor_profiles')
          .where('user_id', uuidToBuffer(existing.userId))
          .update(profileUpdates);
      }

      await this.ensureOrganizationDoctor(existing.organizationId, existing.userId, existing.isActive);
      return;
    }

    if (targetRole === OrganizationUserRole.PATIENT) {
      if (existing.patientFirstName === null && existing.patientLastName === null) {
        await this.createPatientProfile(existing.userId, input.firstName, input.lastName);
      } else if (Object.keys(profileUpdates).length > 0) {
        await this.executor('patient_profiles')
          .where('user_id', uuidToBuffer(existing.userId))
          .update(profileUpdates);
      }
    }
  }

  private async createDoctorProfile(
    userId: string,
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<void> {
    await this.executor('doctor_profiles').insert({
      user_id: uuidToBuffer(userId),
      first_name: firstName,
      last_name: lastName,
      title: null,
      license_number: null,
      bio: null,
    });
  }

  private async createPatientProfile(
    userId: string,
    firstName: string | undefined,
    lastName: string | undefined,
  ): Promise<void> {
    await this.executor('patient_profiles').insert({
      user_id: uuidToBuffer(userId),
      first_name: firstName,
      last_name: lastName,
      date_of_birth: null,
      oib: null,
      address: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
    });
  }

  private async ensureOrganizationDoctor(
    organizationId: string,
    userId: string,
    isActive: boolean,
  ): Promise<void> {
    const existing = await this.executor('organization_doctors')
      .where('organization_id', uuidToBuffer(organizationId))
      .where('doctor_user_id', uuidToBuffer(userId))
      .first('id');

    if (existing) {
      await this.executor('organization_doctors')
        .where('organization_id', uuidToBuffer(organizationId))
        .where('doctor_user_id', uuidToBuffer(userId))
        .update({ is_active: isActive ? 1 : 0 });
      return;
    }

    await this.executor('organization_doctors').insert({
      id: uuidToBuffer(uuidv4()),
      organization_id: uuidToBuffer(organizationId),
      doctor_user_id: uuidToBuffer(userId),
      is_active: isActive ? 1 : 0,
    });
  }
}
