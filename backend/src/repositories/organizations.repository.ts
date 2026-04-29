import { v4 as uuidv4 } from 'uuid';

import type { DatabaseExecutor } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';
import type { OrganizationRecord } from '../types/entities/index.js';

export interface MinimalOrganizationRecord {
  id: string;
  name: string;
}

export interface CreateOrganizationRecordInput {
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
}

export interface UpdateOrganizationRecordInput {
  name?: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string;
}

interface MinimalOrganizationRow {
  id: Buffer;
  name: string;
}

interface OrganizationRow {
  id: Buffer;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  created_at: Date | string;
  updated_at: Date | string;
}

const ORGANIZATION_COLUMNS = [
  'id',
  'name',
  'address',
  'city',
  'phone',
  'email',
  'timezone',
  'created_at',
  'updated_at',
] as const;

const mapDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

const mapMinimalOrganizationRecord = (row: MinimalOrganizationRow): MinimalOrganizationRecord => {
  return {
    id: bufferToUuid(row.id),
    name: row.name,
  };
};

const mapOrganizationRecord = (row: OrganizationRow): OrganizationRecord => {
  return {
    id: bufferToUuid(row.id),
    name: row.name,
    address: row.address,
    city: row.city,
    phone: row.phone,
    email: row.email,
    timezone: row.timezone,
    createdAt: mapDate(row.created_at),
    updatedAt: mapDate(row.updated_at),
  };
};

export class OrganizationsRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async create(input: CreateOrganizationRecordInput): Promise<OrganizationRecord> {
    const id = uuidv4();

    await this.executor('organizations').insert({
      id: uuidToBuffer(id),
      name: input.name,
      address: input.address,
      city: input.city,
      phone: input.phone,
      email: input.email,
      timezone: input.timezone,
    });

    const organization = await this.findById(id);

    if (!organization) {
      throw new Error('Organization creation failed.');
    }

    return organization;
  }

  public async findAll(): Promise<OrganizationRecord[]> {
    const rows = await this.executor<OrganizationRow>('organizations')
      .select(...ORGANIZATION_COLUMNS)
      .orderBy('name', 'asc')
      .orderBy('created_at', 'asc')
      .orderBy('id', 'asc');

    return rows.map(mapOrganizationRecord);
  }

  public async findById(organizationId: string): Promise<OrganizationRecord | null> {
    const row = await this.executor<OrganizationRow>('organizations')
      .select(...ORGANIZATION_COLUMNS)
      .where({ id: uuidToBuffer(organizationId) })
      .first();

    return row ? mapOrganizationRecord(row) : null;
  }

  public async update(
    organizationId: string,
    input: UpdateOrganizationRecordInput,
  ): Promise<OrganizationRecord | null> {
    await this.executor('organizations')
      .where({ id: uuidToBuffer(organizationId) })
      .update(input);

    return this.findById(organizationId);
  }

  public async delete(organizationId: string): Promise<boolean> {
    const deletedCount = await this.executor('organizations')
      .where({ id: uuidToBuffer(organizationId) })
      .delete();

    return deletedCount > 0;
  }

  public async findMinimalByIds(
    organizationIds: readonly string[],
  ): Promise<MinimalOrganizationRecord[]> {
    if (organizationIds.length === 0) {
      return [];
    }

    const rows = await this.executor<MinimalOrganizationRow>('organizations')
      .select('id', 'name')
      .whereIn(
        'id',
        organizationIds.map((organizationId) => uuidToBuffer(organizationId)),
      );

    return rows.map(mapMinimalOrganizationRecord);
  }
}
