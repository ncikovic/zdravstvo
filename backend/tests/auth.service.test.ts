import assert from "node:assert/strict";
import test from "node:test";

import { OrganizationUserRole, UserStatus } from "@zdravstvo/contracts";

import { AppError } from "../src/errors/AppError.js";
import { AuthService } from "../src/services/auth.service.js";
import type {
  OrganizationRecord,
  OrganizationUserRecord,
  PatientProfileRecord,
  UserRecord,
} from "../src/types/entities/index.js";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const SECOND_USER_ID = "22222222-2222-4222-8222-222222222222";
const ORGANIZATION_ID = "33333333-3333-4333-8333-333333333333";
const SECOND_ORGANIZATION_ID = "44444444-4444-4444-8444-444444444444";
const ORG_USER_ID = "55555555-5555-4555-8555-555555555555";
const SECOND_ORG_USER_ID = "66666666-6666-4666-8666-666666666666";
const PASSWORD = "Demo1234!";
const PASSWORD_HASH = "hashed-password";

interface CreateUserInput {
  email: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
}

interface CreatePatientProfileInput {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

interface CreateOrganizationUserInput {
  organizationId: string;
  userId: string;
  role: OrganizationUserRole;
  isActive: boolean;
}

interface CreateOrganizationInput {
  name: string;
  timezone: string;
}

interface DatabaseErrorLike {
  code: string;
  message: string;
}

class InMemoryAuthStore {
  public users: UserRecord[] = [];
  public profiles: PatientProfileRecord[] = [];
  public memberships: OrganizationUserRecord[] = [];
  public organizations: OrganizationRecord[] = [];
  public nextDatabaseError: DatabaseErrorLike | null = null;

  private nextId = 0;

  public createId(): string {
    this.nextId += 1;

    return `00000000-0000-4000-8000-${this.nextId.toString().padStart(12, "0")}`;
  }
}

class InMemoryUsersRepository {
  public constructor(private readonly store: InMemoryAuthStore) {}

  public async findByEmailOrPhone(
    identifier: string,
  ): Promise<UserRecord | null> {
    return (
      this.store.users.find(
        (user) => user.email === identifier || user.phone === identifier,
      ) ?? null
    );
  }

  public async findById(userId: string): Promise<UserRecord | null> {
    return this.store.users.find((user) => user.id === userId) ?? null;
  }
}

class InMemoryOrganizationUsersRepository {
  public constructor(private readonly store: InMemoryAuthStore) {}

  public async findActiveMembershipsByUserId(
    userId: string,
  ): Promise<OrganizationUserRecord[]> {
    return this.store.memberships.filter(
      (membership) => membership.userId === userId && membership.isActive,
    );
  }

  public async findActiveMembershipByUserIdAndOrganizationId(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationUserRecord | null> {
    return (
      this.store.memberships.find(
        (membership) =>
          membership.userId === userId &&
          membership.organizationId === organizationId &&
          membership.isActive,
      ) ?? null
    );
  }
}

class InMemoryAuthRepository {
  public constructor(private readonly store: InMemoryAuthStore) {}

  public async findPatientProfileByUserId(
    userId: string,
  ): Promise<PatientProfileRecord | null> {
    return (
      this.store.profiles.find((profile) => profile.userId === userId) ?? null
    );
  }

  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.store.users.find((user) => user.email === email) ?? null;
  }

  public async findUserByPhone(phone: string): Promise<UserRecord | null> {
    return this.store.users.find((user) => user.phone === phone) ?? null;
  }

  public async findDefaultOrganizationId(): Promise<string | null> {
    return this.store.organizations[0]?.id ?? null;
  }

  public async createOrganization(
    input: CreateOrganizationInput,
  ): Promise<string> {
    const id = this.store.createId();

    this.store.organizations.push({
      id,
      name: input.name,
      address: null,
      city: null,
      phone: null,
      email: null,
      timezone: input.timezone,
      createdAt: new Date("2026-04-21T18:00:00.000Z"),
      updatedAt: new Date("2026-04-21T18:00:00.000Z"),
    });

    return id;
  }

  public async createUser(input: CreateUserInput): Promise<UserRecord> {
    if (this.store.nextDatabaseError) {
      const error = this.store.nextDatabaseError;
      this.store.nextDatabaseError = null;
      throw error;
    }

    const user = {
      id: this.store.createId(),
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      status: input.status,
    };

    this.store.users.push(user);

    return user;
  }

  public async createPatientProfile(
    input: CreatePatientProfileInput,
  ): Promise<PatientProfileRecord> {
    const profile = {
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      oib: input.oib,
      address: input.address,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
    };

    this.store.profiles.push(profile);

    return profile;
  }

  public async createOrganizationUser(
    input: CreateOrganizationUserInput,
  ): Promise<OrganizationUserRecord> {
    const membership = {
      id: this.store.createId(),
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role,
      isActive: input.isActive,
    };

    this.store.memberships.push(membership);

    return membership;
  }
}

class InMemoryOrganizationsRepository {
  public constructor(private readonly store: InMemoryAuthStore) {}

  public async findMinimalByIds(
    organizationIds: readonly string[],
  ): Promise<Array<Pick<OrganizationRecord, "id" | "name">>> {
    return this.store.organizations.filter((organization) =>
      organizationIds.includes(organization.id),
    );
  }

  public async findById(
    organizationId: string,
  ): Promise<OrganizationRecord | null> {
    return (
      this.store.organizations.find(
        (organization) => organization.id === organizationId,
      ) ?? null
    );
  }
}

const seedUser = (
  store: InMemoryAuthStore,
  overrides: Partial<UserRecord> = {},
): UserRecord => {
  const user = {
    id: USER_ID,
    email: "admin@example.test",
    phone: "+385911111111",
    passwordHash: PASSWORD_HASH,
    status: UserStatus.ACTIVE,
    ...overrides,
  };

  store.users.push(user);

  return user;
};

const seedOrganization = (
  store: InMemoryAuthStore,
  overrides: Partial<OrganizationRecord> = {},
): OrganizationRecord => {
  const organization = {
    id: ORGANIZATION_ID,
    name: "Poliklinika Zagreb",
    address: null,
    city: null,
    phone: null,
    email: null,
    timezone: "Europe/Zagreb",
    createdAt: new Date("2026-04-21T18:00:00.000Z"),
    updatedAt: new Date("2026-04-21T18:00:00.000Z"),
    ...overrides,
  };

  store.organizations.push(organization);

  return organization;
};

const seedMembership = (
  store: InMemoryAuthStore,
  overrides: Partial<OrganizationUserRecord> = {},
): OrganizationUserRecord => {
  const membership = {
    id: ORG_USER_ID,
    organizationId: ORGANIZATION_ID,
    userId: USER_ID,
    role: OrganizationUserRole.ADMIN,
    isActive: true,
    ...overrides,
  };

  store.memberships.push(membership);

  return membership;
};

const createService = (store = new InMemoryAuthStore()) => {
  const authRepository = new InMemoryAuthRepository(store);
  const organizationsRepository = new InMemoryOrganizationsRepository(store);
  const service = new AuthService({
    usersRepository: new InMemoryUsersRepository(store),
    organizationUsersRepository: new InMemoryOrganizationUsersRepository(store),
    authRepository,
    organizationsRepository,
    runRegistrationTransaction: async (handler) =>
      handler(authRepository, organizationsRepository),
    comparePassword: async (password, passwordHash) =>
      password === PASSWORD && passwordHash === PASSWORD_HASH,
    hashPassword: async (password, saltRounds) =>
      `${password}:${saltRounds}:hash`,
    createAccessToken: (claims) =>
      `access:${claims.sub}:${claims.organizationId}:${claims.orgUserId}:${claims.role}`,
    createOrganizationSelectionToken: (claims) => `selection:${claims.sub}`,
    readOrganizationSelectionToken: (token) => ({
      sub: token.replace("selection:", ""),
      purpose: "organization_selection",
    }),
  });

  return { service, store };
};

const assertAppError = async (
  operation: () => Promise<unknown>,
  status: number,
  code: string,
): Promise<void> => {
  await assert.rejects(operation, (error: unknown) => {
    assert(error instanceof AppError);
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    return true;
  });
};

test("logs in a user with a single active organization", async () => {
  const { service, store } = createService();

  seedUser(store);
  seedOrganization(store);
  seedMembership(store);

  const response = await service.login({
    identifier: " Admin@Example.test ",
    password: PASSWORD,
  });

  assert.equal(response.authenticated, true);

  if (response.authenticated) {
    assert.equal(
      response.accessToken,
      `access:${USER_ID}:${ORGANIZATION_ID}:${ORG_USER_ID}:ADMIN`,
    );
    assert.equal(response.user.email, "admin@example.test");
    assert.equal(response.organizationId, ORGANIZATION_ID);
  }
});

test("rejects invalid login credentials", async () => {
  const { service, store } = createService();

  seedUser(store);
  seedMembership(store);

  await assertAppError(
    () =>
      service.login({
        identifier: "admin@example.test",
        password: "wrong-password",
      }),
    401,
    "UNAUTHORIZED",
  );
});

test("requires organization selection when multiple memberships exist", async () => {
  const { service, store } = createService();

  seedUser(store);
  seedOrganization(store);
  seedOrganization(store, {
    id: SECOND_ORGANIZATION_ID,
    name: "Ambulanta Split",
  });
  seedMembership(store);
  seedMembership(store, {
    id: SECOND_ORG_USER_ID,
    organizationId: SECOND_ORGANIZATION_ID,
    role: OrganizationUserRole.RECEPTION,
  });

  const response = await service.login({
    identifier: "admin@example.test",
    password: PASSWORD,
  });

  assert.equal(response.authenticated, false);

  if (!response.authenticated) {
    assert.equal(response.selectionToken, `selection:${USER_ID}`);
    assert.deepEqual(
      response.memberships.map((membership) => membership.organizationName),
      ["Poliklinika Zagreb", "Ambulanta Split"],
    );
  }
});

test("selects an organization from a valid selection token", async () => {
  const { service, store } = createService();

  seedUser(store);
  seedOrganization(store);
  seedMembership(store);

  const response = await service.selectOrganization({
    selectionToken: `selection:${USER_ID}`,
    organizationId: ORGANIZATION_ID,
  });

  assert.equal(response.authenticated, true);
  assert.equal(
    response.accessToken,
    `access:${USER_ID}:${ORGANIZATION_ID}:${ORG_USER_ID}:ADMIN`,
  );
});

test("rejects organization selection outside the user memberships", async () => {
  const { service, store } = createService();

  seedUser(store);
  seedMembership(store);

  await assertAppError(
    () =>
      service.selectOrganization({
        selectionToken: `selection:${USER_ID}`,
        organizationId: SECOND_ORGANIZATION_ID,
      }),
    403,
    "FORBIDDEN",
  );
});

test("registers a patient in an existing organization", async () => {
  const { service, store } = createService();

  seedOrganization(store);

  const response = await service.register({
    organizationId: ORGANIZATION_ID,
    email: " New.Patient@Example.test ",
    phone: " +385911111112 ",
    password: PASSWORD,
    firstName: " Petra ",
    lastName: " Novak ",
    dateOfBirth: "1988-03-14",
  });

  assert.equal(response.organizationId, ORGANIZATION_ID);
  assert.equal(response.role, OrganizationUserRole.PATIENT);
  assert.equal(response.user.email, "new.patient@example.test");
  assert.equal(store.users[0].passwordHash, `${PASSWORD}:12:hash`);
  assert.equal(store.profiles[0].firstName, "Petra");
  assert.equal(store.memberships[0].role, OrganizationUserRole.PATIENT);
});

test("registers a patient and creates a default organization when needed", async () => {
  const { service, store } = createService();

  const response = await service.register({
    email: "patient@example.test",
    phone: "+385911111113",
    password: PASSWORD,
    firstName: "Ivan",
    lastName: "Maric",
  });

  assert.equal(store.organizations.length, 1);
  assert.equal(store.organizations[0].name, "Zdravstvo");
  assert.equal(response.organizationId, store.organizations[0].id);
});

test("rejects duplicate registration email and phone before writing", async () => {
  const { service, store } = createService();

  seedUser(store, {
    email: "patient@example.test",
    phone: "+385911111114",
  });

  await assertAppError(
    () =>
      service.register({
        email: "patient@example.test",
        phone: "+385911111115",
        password: PASSWORD,
        firstName: "Ana",
        lastName: "Anic",
      }),
    409,
    "EMAIL_ALREADY_EXISTS",
  );

  await assertAppError(
    () =>
      service.register({
        email: "other@example.test",
        phone: "+385911111114",
        password: PASSWORD,
        firstName: "Ana",
        lastName: "Anic",
      }),
    409,
    "PHONE_ALREADY_EXISTS",
  );
});

test("rejects registration for a missing organization", async () => {
  const { service } = createService();

  await assertAppError(
    () =>
      service.register({
        organizationId: ORGANIZATION_ID,
        email: "patient@example.test",
        phone: "+385911111116",
        password: PASSWORD,
        firstName: "Ana",
        lastName: "Anic",
      }),
    404,
    "NOT_FOUND",
  );
});

test("maps raw duplicate database errors during registration", async () => {
  const { service, store } = createService();

  seedOrganization(store);
  store.nextDatabaseError = {
    code: "ER_DUP_ENTRY",
    message: "Duplicate entry for key 'uq_users_email'",
  };

  await assertAppError(
    () =>
      service.register({
        organizationId: ORGANIZATION_ID,
        email: "patient@example.test",
        phone: "+385911111117",
        password: PASSWORD,
        firstName: "Ana",
        lastName: "Anic",
      }),
    409,
    "EMAIL_ALREADY_EXISTS",
  );
});
