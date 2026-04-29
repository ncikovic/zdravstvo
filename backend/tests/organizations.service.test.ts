import assert from 'node:assert/strict';
import test from 'node:test';

import { AppError } from '../src/errors/AppError.js';
import type {
  CreateOrganizationRecordInput,
  UpdateOrganizationRecordInput,
} from '../src/repositories/index.js';
import { OrganizationsService } from '../src/services/organizations.service.js';
import type { OrganizationRecord } from '../src/types/entities/index.js';

const ORGANIZATION_ID = '11111111-1111-4111-8111-111111111111';
const SECOND_ORGANIZATION_ID = '22222222-2222-4222-8222-222222222222';
const MISSING_ORGANIZATION_ID = '33333333-3333-4333-8333-333333333333';
const CREATED_AT = new Date('2026-04-21T18:00:00.000Z');
const UPDATED_AT = new Date('2026-04-21T19:00:00.000Z');

const createOrganizationRecord = (
  overrides: Partial<OrganizationRecord> = {},
): OrganizationRecord => {
  return {
    id: ORGANIZATION_ID,
    name: 'Poliklinika Zagreb',
    address: 'Ilica 1',
    city: 'Zagreb',
    phone: '+38511234567',
    email: 'info@poliklinika.test',
    timezone: 'Europe/Zagreb',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
};

class InMemoryOrganizationsRepository {
  public records: OrganizationRecord[];

  public constructor(records: OrganizationRecord[] = []) {
    this.records = records;
  }

  public async create(input: CreateOrganizationRecordInput): Promise<OrganizationRecord> {
    const organization = createOrganizationRecord({
      ...input,
      id: ORGANIZATION_ID,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    });

    this.records.push(organization);

    return organization;
  }

  public async findAll(): Promise<OrganizationRecord[]> {
    return this.records;
  }

  public async findById(organizationId: string): Promise<OrganizationRecord | null> {
    return this.records.find((organization) => organization.id === organizationId) ?? null;
  }

  public async update(
    organizationId: string,
    input: UpdateOrganizationRecordInput,
  ): Promise<OrganizationRecord | null> {
    const organization = await this.findById(organizationId);

    if (!organization) {
      return null;
    }

    Object.assign(organization, input, {
      updatedAt: new Date('2026-04-21T20:00:00.000Z'),
    });

    return organization;
  }

  public async delete(organizationId: string): Promise<boolean> {
    const initialCount = this.records.length;

    this.records = this.records.filter((organization) => organization.id !== organizationId);

    return this.records.length < initialCount;
  }
}

const createService = (
  records: OrganizationRecord[] = [],
): {
  repository: InMemoryOrganizationsRepository;
  service: OrganizationsService;
} => {
  const repository = new InMemoryOrganizationsRepository(records);
  const service = new OrganizationsService(repository);

  return { repository, service };
};

const assertNotFound = async (operation: () => Promise<unknown>) => {
  await assert.rejects(operation, (error: unknown) => {
    assert(error instanceof AppError);
    assert.equal(error.status, 404);
    assert.equal(error.code, 'NOT_FOUND');
    return true;
  });
};

test('creates an organization', async () => {
  const { repository, service } = createService();

  const organization = await service.create({
    name: ' Poliklinika Zagreb ',
    address: ' Ilica 1 ',
    city: ' Zagreb ',
    phone: ' +38511234567 ',
    email: ' info@poliklinika.test ',
    timezone: ' Europe/Zagreb ',
  });

  assert.equal(repository.records.length, 1);
  assert.equal(organization.name, 'Poliklinika Zagreb');
  assert.equal(organization.email, 'info@poliklinika.test');
  assert.equal(organization.timezone, 'Europe/Zagreb');
  assert.equal(organization.createdAt, CREATED_AT.toISOString());
  assert.equal(organization.updatedAt, UPDATED_AT.toISOString());
});

test('gets an organization by id', async () => {
  const { service } = createService([createOrganizationRecord()]);

  const organization = await service.getById(ORGANIZATION_ID);

  assert.equal(organization.id, ORGANIZATION_ID);
  assert.equal(organization.timezone, 'Europe/Zagreb');
});

test('lists organizations', async () => {
  const { service } = createService([
    createOrganizationRecord(),
    createOrganizationRecord({
      id: SECOND_ORGANIZATION_ID,
      name: 'Ambulanta Split',
    }),
  ]);

  const response = await service.list();

  assert.equal(response.organizations.length, 2);
  assert.deepEqual(
    response.organizations.map((organization) => organization.id),
    [ORGANIZATION_ID, SECOND_ORGANIZATION_ID],
  );
});

test('updates an organization', async () => {
  const { service } = createService([createOrganizationRecord()]);

  const organization = await service.update(ORGANIZATION_ID, {
    name: 'Poliklinika Centar',
    address: null,
    timezone: 'Europe/Zagreb',
  });

  assert.equal(organization.name, 'Poliklinika Centar');
  assert.equal(organization.address, null);
  assert.equal(organization.updatedAt, '2026-04-21T20:00:00.000Z');
});

test('deletes an organization', async () => {
  const { repository, service } = createService([createOrganizationRecord()]);

  await service.delete(ORGANIZATION_ID);

  assert.equal(repository.records.length, 0);
});

test('throws not found for missing organizations', async () => {
  const { service } = createService();

  await assertNotFound(() => service.getById(MISSING_ORGANIZATION_ID));
  await assertNotFound(() => service.update(MISSING_ORGANIZATION_ID, { name: 'Missing' }));
  await assertNotFound(() => service.delete(MISSING_ORGANIZATION_ID));
});
