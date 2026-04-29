import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';

export interface MinimalOrganizationRecord {
  id: string;
  name: string;
}

interface MinimalOrganizationRow {
  id: Buffer;
  name: string;
}

const mapMinimalOrganizationRecord = (
  row: MinimalOrganizationRow
): MinimalOrganizationRecord => {
  return {
    id: bufferToUuid(row.id),
    name: row.name,
  };
};

export class OrganizationsRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findMinimalByIds(
    organizationIds: readonly string[]
  ): Promise<MinimalOrganizationRecord[]> {
    if (organizationIds.length === 0) {
      return [];
    }

    const rows = await this.executor<MinimalOrganizationRow>('organizations')
      .select('id', 'name')
      .whereIn(
        'id',
        organizationIds.map((organizationId) => uuidToBuffer(organizationId))
      );

    return rows.map(mapMinimalOrganizationRecord);
  }
}
