import type { OrganizationUserRole, UserStatus } from '@zdravstvo/contracts';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';

export interface AdminUserRecord {
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

export interface FindAdminUsersInput {
  limit: number;
  offset: number;
  organizationId?: string;
  role?: OrganizationUserRole;
  search?: string;
}

export interface UpdateAdminUserRecordInput {
  email?: string | null;
  phone?: string | null;
  role?: OrganizationUserRole;
  firstName?: string;
  lastName?: string;
}

interface AdminUserRow {
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

const mapAdminUserRecord = (row: AdminUserRow): AdminUserRecord => ({
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
  input: FindAdminUsersInput,
): ReturnType<DatabaseExecutor['from']> => {
  let q = query;

  if (input.organizationId) {
    q = q.where('ou.organization_id', uuidToBuffer(input.organizationId));
  }

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

export class AdminUsersRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findMany(input: FindAdminUsersInput): Promise<AdminUserRecord[]> {
    const rows = await applyFilters(this.createAdminUsersQuery(), input)
      .orderBy('o.name', 'asc')
      .orderBy('ou.created_at', 'asc')
      .limit(input.limit)
      .offset(input.offset);

    return (rows as AdminUserRow[]).map(mapAdminUserRecord);
  }

  public async countMany(input: FindAdminUsersInput): Promise<number> {
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

  public async findByOrgUserId(orgUserId: string): Promise<AdminUserRecord | null> {
    const row = await this.createAdminUsersQuery()
      .where('ou.id', uuidToBuffer(orgUserId))
      .first<AdminUserRow>();

    return row ? mapAdminUserRecord(row) : null;
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

  public async update(orgUserId: string, input: UpdateAdminUserRecordInput): Promise<void> {
    const existing = await this.findByOrgUserId(orgUserId);

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
        .update({ role: input.role });
    }

    const profileUpdates: Record<string, string> = {};
    if (input.firstName !== undefined) profileUpdates.first_name = input.firstName;
    if (input.lastName !== undefined) profileUpdates.last_name = input.lastName;

    if (Object.keys(profileUpdates).length === 0) {
      return;
    }

    if (existing.doctorFirstName !== null || existing.doctorLastName !== null) {
      await this.executor('doctor_profiles')
        .where('user_id', uuidToBuffer(existing.userId))
        .update(profileUpdates);
      return;
    }

    if (existing.patientFirstName !== null || existing.patientLastName !== null) {
      await this.executor('patient_profiles')
        .where('user_id', uuidToBuffer(existing.userId))
        .update(profileUpdates);
    }
  }

  public async activate(orgUserId: string): Promise<boolean> {
    return this.setActive(orgUserId, true);
  }

  public async deactivate(orgUserId: string): Promise<boolean> {
    return this.setActive(orgUserId, false);
  }

  private createAdminUsersQuery(): ReturnType<DatabaseExecutor['from']> {
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

  private async setActive(orgUserId: string, isActive: boolean): Promise<boolean> {
    const updated = await this.executor('organization_users')
      .where('id', uuidToBuffer(orgUserId))
      .update({ is_active: isActive ? 1 : 0 });

    return updated > 0;
  }
}
