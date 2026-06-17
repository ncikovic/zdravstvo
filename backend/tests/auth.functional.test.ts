import assert from 'node:assert/strict';
import test from 'node:test';

import { loginRequestSchema, OrganizationUserRole, UserStatus } from '@zdravstvo/contracts';

import { AppError } from '../src/errors/AppError.js';
import { AuthService } from '../src/services/auth.service.js';
import { signAccessToken, verifyAccessToken, signOrganizationSelectionToken, verifyOrganizationSelectionToken } from '../src/shared/utils/jwt.js';
import type {
  OrganizationRecord,
  OrganizationUserRecord,
  UserRecord,
} from '../src/types/entities/index.js';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const ORGANIZATION_ID = '33333333-3333-4333-8333-333333333333';
const ORG_USER_ID = '55555555-5555-4555-8555-555555555555';
const PASSWORD = 'Demo1234!';
const PASSWORD_HASH = 'hashed-password';

class FunctionalStore {
  public users: UserRecord[] = [];
  public organizations: OrganizationRecord[] = [];
  public memberships: OrganizationUserRecord[] = [];
  private nextId = 0;

  public createId(): string {
    this.nextId += 1;
    return `00000000-0000-4000-8000-${this.nextId.toString().padStart(12, '0')}`;
  }
}

class StubUsersRepo {
  constructor(private readonly store: FunctionalStore) {}
  async findByEmailOrPhone(id: string): Promise<UserRecord | null> {
    return this.store.users.find((u) => u.email === id || u.phone === id) ?? null;
  }
  async findById(userId: string): Promise<UserRecord | null> {
    return this.store.users.find((u) => u.id === userId) ?? null;
  }
}

class StubOrgUsersRepo {
  constructor(private readonly store: FunctionalStore) {}
  async findActiveMembershipsByUserId(userId: string): Promise<OrganizationUserRecord[]> {
    return this.store.memberships.filter((m) => m.userId === userId && m.isActive);
  }
  async findActiveMembershipByUserIdAndOrganizationId(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationUserRecord | null> {
    return (
      this.store.memberships.find(
        (m) => m.userId === userId && m.organizationId === organizationId && m.isActive,
      ) ?? null
    );
  }
}

class StubAuthRepo {
  constructor(private readonly store: FunctionalStore) {}
  async findPatientProfileByUserId(): Promise<null> { return null; }
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.store.users.find((u) => u.email === email) ?? null;
  }
  async findUserByPhone(phone: string): Promise<UserRecord | null> {
    return this.store.users.find((u) => u.phone === phone) ?? null;
  }
  async findDefaultOrganizationId(): Promise<string | null> {
    return this.store.organizations[0]?.id ?? null;
  }
  async createOrganization(input: { name: string; timezone: string }): Promise<string> {
    const id = this.store.createId();
    this.store.organizations.push({ id, name: input.name, address: null, city: null, phone: null, email: null, timezone: input.timezone, createdAt: new Date(), updatedAt: new Date() });
    return id;
  }
  async createUser(input: { email: string; phone: string; passwordHash: string; status: UserStatus }): Promise<UserRecord> {
    const user = { id: this.store.createId(), ...input };
    this.store.users.push(user);
    return user;
  }
  async createPatientProfile(input: Record<string, unknown>): Promise<Record<string, unknown>> { return input; }
  async createOrganizationUser(input: { organizationId: string; userId: string; role: OrganizationUserRole; isActive: boolean }): Promise<OrganizationUserRecord> {
    const membership = { id: this.store.createId(), ...input };
    this.store.memberships.push(membership);
    return membership;
  }
}

class StubOrgsRepo {
  constructor(private readonly store: FunctionalStore) {}
  async findMinimalByIds(ids: readonly string[]): Promise<Array<{ id: string; name: string }>> {
    return this.store.organizations.filter((o) => ids.includes(o.id));
  }
  async findById(id: string): Promise<OrganizationRecord | null> {
    return this.store.organizations.find((o) => o.id === id) ?? null;
  }
}

const createService = (store = new FunctionalStore()) => {
  const authRepo = new StubAuthRepo(store);
  const orgsRepo = new StubOrgsRepo(store);
  const service = new AuthService({
    usersRepository: new StubUsersRepo(store),
    organizationUsersRepository: new StubOrgUsersRepo(store),
    authRepository: authRepo,
    organizationsRepository: orgsRepo,
    runRegistrationTransaction: async (handler) => handler(authRepo, orgsRepo),
    comparePassword: async (pw, hash) => pw === PASSWORD && hash === PASSWORD_HASH,
    hashPassword: async (pw, rounds) => `${pw}:${rounds}:hash`,
    createAccessToken: (claims) => signAccessToken(claims),
    createOrganizationSelectionToken: (claims) => signOrganizationSelectionToken(claims),
    readOrganizationSelectionToken: (token) => verifyOrganizationSelectionToken(token),
  });
  return { service, store };
};

const seedUser = (store: FunctionalStore): UserRecord => {
  const user: UserRecord = { id: USER_ID, email: 'admin@example.test', phone: '+385911111111', passwordHash: PASSWORD_HASH, status: UserStatus.ACTIVE };
  store.users.push(user);
  return user;
};

const seedOrg = (store: FunctionalStore): OrganizationRecord => {
  const org: OrganizationRecord = { id: ORGANIZATION_ID, name: 'Poliklinika Zagreb', address: null, city: null, phone: null, email: null, timezone: 'Europe/Zagreb', createdAt: new Date(), updatedAt: new Date() };
  store.organizations.push(org);
  return org;
};

const seedMembership = (store: FunctionalStore): OrganizationUserRecord => {
  const m: OrganizationUserRecord = { id: ORG_USER_ID, organizationId: ORGANIZATION_ID, userId: USER_ID, role: OrganizationUserRole.MANAGER, isActive: true };
  store.memberships.push(m);
  return m;
};

test('login produces a real JWT that verifyAccessToken can decode', async () => {
  const { service, store } = createService();
  seedUser(store);
  seedOrg(store);
  seedMembership(store);

  const response = await service.login({ identifier: 'admin@example.test', password: PASSWORD });

  assert.equal(response.authenticated, true);

  if (response.authenticated) {
    const claims = verifyAccessToken(response.accessToken);
    assert.equal(claims.sub, USER_ID);
    assert.equal(claims.isSystemAdmin, false);
    if (!claims.isSystemAdmin) {
      assert.equal(claims.organizationId, ORGANIZATION_ID);
      assert.equal(claims.role, OrganizationUserRole.MANAGER);
    }
  }
});

test('login response user object does not contain passwordHash', async () => {
  const { service, store } = createService();
  seedUser(store);
  seedOrg(store);
  seedMembership(store);

  const response = await service.login({ identifier: 'admin@example.test', password: PASSWORD });

  assert.equal(response.authenticated, true);

  if (response.authenticated) {
    assert(!Object.prototype.hasOwnProperty.call(response.user, 'passwordHash'),
      'passwordHash must not be present in auth response user object');
  }
});

test('selection token from multi-org login can be verified', async () => {
  const { service, store } = createService();
  const SECOND_ORG_ID = '44444444-4444-4444-8444-444444444444';
  seedUser(store);
  seedOrg(store);
  store.organizations.push({ id: SECOND_ORG_ID, name: 'Ambulanta Split', address: null, city: null, phone: null, email: null, timezone: 'Europe/Zagreb', createdAt: new Date(), updatedAt: new Date() });
  seedMembership(store);
  store.memberships.push({ id: '66666666-6666-4666-8666-666666666666', organizationId: SECOND_ORG_ID, userId: USER_ID, role: OrganizationUserRole.RECEPTION, isActive: true });

  const response = await service.login({ identifier: 'admin@example.test', password: PASSWORD });

  assert.equal(response.authenticated, false);

  if (!response.authenticated) {
    const claims = verifyOrganizationSelectionToken(response.selectionToken);
    assert.equal(claims.sub, USER_ID);
    assert.equal(claims.purpose, 'organization_selection');
  }
});

test('loginRequestSchema rejects empty identifier', () => {
  const result = loginRequestSchema.safeParse({ identifier: '', password: 'password123' });
  assert.equal(result.success, false);
});

test('loginRequestSchema rejects empty password', () => {
  const result = loginRequestSchema.safeParse({ identifier: 'user@example.com', password: '' });
  assert.equal(result.success, false);
});

test('loginRequestSchema rejects missing both identifier fields', () => {
  const result = loginRequestSchema.safeParse({ password: 'password123' });
  assert.equal(result.success, false);
});

test('loginRequestSchema accepts valid email identifier and password', () => {
  const result = loginRequestSchema.safeParse({
    identifier: 'user@example.com',
    password: 'password123',
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.identifier, 'user@example.com');
  }
});
