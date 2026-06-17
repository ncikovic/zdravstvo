import type { OrganizationUserRole } from '@zdravstvo/contracts';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';
import type { OrganizationUserRecord } from '../types/entities/index.js';

interface OrganizationUserRow {
  id: Buffer;
  organization_id: Buffer;
  user_id: Buffer;
  role: OrganizationUserRole;
  is_active: number | boolean;
}

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

export class OrganizationUsersRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findActiveMembershipsByUserId(
    userId: string
  ): Promise<OrganizationUserRecord[]> {
    const rows = await this.executor<OrganizationUserRow>('organization_users')
      .select('id', 'organization_id', 'user_id', 'role', 'is_active')
      .where('user_id', uuidToBuffer(userId))
      .andWhere('is_active', 1)
      .orderBy('created_at', 'asc');

    return rows.map(mapOrganizationUserRecord);
  }

  public async findActiveMembershipByUserIdAndOrganizationId(
    userId: string,
    organizationId: string
  ): Promise<OrganizationUserRecord | null> {
    const row = await this.executor<OrganizationUserRow>('organization_users')
      .select('id', 'organization_id', 'user_id', 'role', 'is_active')
      .where('user_id', uuidToBuffer(userId))
      .andWhere('organization_id', uuidToBuffer(organizationId))
      .andWhere('is_active', 1)
      .first();

    return row ? mapOrganizationUserRecord(row) : null;
  }
}
