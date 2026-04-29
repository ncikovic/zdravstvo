import assert from "node:assert/strict";
import test from "node:test";

import {
  OrganizationUserRole,
  UserStatus,
  type UpdateDoctorRequestDto,
} from "@zdravstvo/contracts";

import { AppError } from "../src/errors/AppError.js";
import { DoctorsService } from "../src/services/doctors.service.js";
import type {
  DoctorOrganizationUserRecord,
  DoctorProfileRecord,
  DoctorRecord,
  DoctorTimeOffRecord,
  DoctorUserRecord,
  DoctorWorkingHourRecord,
  OrganizationDoctorRecord,
} from "../src/types/entities/index.js";

const ORGANIZATION_ID = "11111111-1111-4111-8111-111111111111";
const SECOND_ORGANIZATION_ID = "22222222-2222-4222-8222-222222222222";
const ADMIN_ORG_USER_ID = "33333333-3333-4333-8333-333333333333";
const DOCTOR_ID = "44444444-4444-4444-8444-444444444444";
const SECOND_DOCTOR_ID = "55555555-5555-4555-8555-555555555555";
const TIME_OFF_ID = "66666666-6666-4666-8666-666666666666";
const CREATED_AT = new Date("2026-04-21T18:00:00.000Z");
const UPDATED_AT = new Date("2026-04-21T19:00:00.000Z");
const UPDATED_AFTER_MUTATION_AT = new Date("2026-04-21T20:00:00.000Z");

const createContext = (organizationId = ORGANIZATION_ID) => ({
  organizationId,
  organizationUserId: ADMIN_ORG_USER_ID,
  role: OrganizationUserRole.ADMIN,
});

const createId = (() => {
  let currentId = 0;

  return (): string => {
    currentId += 1;

    return `00000000-0000-4000-8000-${currentId.toString().padStart(12, "0")}`;
  };
})();

class InMemoryDoctorsRepository {
  public users: DoctorUserRecord[] = [];
  public profiles: DoctorProfileRecord[] = [];
  public organizationDoctors: OrganizationDoctorRecord[] = [];
  public organizationUsers: DoctorOrganizationUserRecord[] = [];
  public workingHours: DoctorWorkingHourRecord[] = [];
  public timeOff: DoctorTimeOffRecord[] = [];
  public failNextCreateProfileWithDuplicateLicense = false;

  public async findUserById(userId: string): Promise<DoctorUserRecord | null> {
    return this.users.find((user) => user.id === userId) ?? null;
  }

  public async findUserByEmail(
    email: string,
  ): Promise<DoctorUserRecord | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  public async findUserByPhone(
    phone: string,
  ): Promise<DoctorUserRecord | null> {
    return this.users.find((user) => user.phone === phone) ?? null;
  }

  public async createUser(input: {
    email: string | null;
    phone: string | null;
    passwordHash: string | null;
    status: UserStatus;
  }): Promise<DoctorUserRecord> {
    const user = {
      id: createId(),
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      status: input.status,
    };

    this.users.push(user);

    return user;
  }

  public async findDoctorProfileByUserId(
    userId: string,
  ): Promise<DoctorProfileRecord | null> {
    return this.profiles.find((profile) => profile.userId === userId) ?? null;
  }

  public async findDoctorProfileByLicenseNumber(
    licenseNumber: string,
  ): Promise<DoctorProfileRecord | null> {
    return (
      this.profiles.find(
        (profile) => profile.licenseNumber === licenseNumber,
      ) ?? null
    );
  }

  public async createDoctorProfile(input: {
    userId: string;
    firstName: string;
    lastName: string;
    title: string | null;
    licenseNumber: string | null;
    bio: string | null;
  }): Promise<DoctorProfileRecord> {
    if (this.failNextCreateProfileWithDuplicateLicense) {
      this.failNextCreateProfileWithDuplicateLicense = false;
      throw {
        code: "ER_DUP_ENTRY",
        message: "Duplicate entry 'HR-1' for key 'uq_doctor_license'",
      };
    }

    const profile = {
      userId: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      title: input.title,
      licenseNumber: input.licenseNumber,
      bio: input.bio,
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };

    this.profiles.push(profile);

    return profile;
  }

  public async updateDoctorProfile(
    doctorUserId: string,
    input: {
      firstName?: string;
      lastName?: string;
      title?: string | null;
      licenseNumber?: string | null;
      bio?: string | null;
    },
  ): Promise<DoctorProfileRecord | null> {
    const profile = await this.findDoctorProfileByUserId(doctorUserId);

    if (!profile) {
      return null;
    }

    Object.assign(profile, input, {
      updatedAt: UPDATED_AFTER_MUTATION_AT,
    });

    return profile;
  }

  public async findOrganizationDoctor(
    organizationId: string,
    doctorUserId: string,
  ): Promise<OrganizationDoctorRecord | null> {
    return (
      this.organizationDoctors.find(
        (doctor) =>
          doctor.organizationId === organizationId &&
          doctor.doctorUserId === doctorUserId,
      ) ?? null
    );
  }

  public async createOrganizationDoctor(input: {
    organizationId: string;
    doctorUserId: string;
    isActive: boolean;
  }): Promise<OrganizationDoctorRecord> {
    const organizationDoctor = {
      id: createId(),
      organizationId: input.organizationId,
      doctorUserId: input.doctorUserId,
      isActive: input.isActive,
      createdAt: CREATED_AT,
    };

    this.organizationDoctors.push(organizationDoctor);

    return organizationDoctor;
  }

  public async updateOrganizationDoctorActive(
    organizationId: string,
    doctorUserId: string,
    isActive: boolean,
  ): Promise<OrganizationDoctorRecord | null> {
    const organizationDoctor = await this.findOrganizationDoctor(
      organizationId,
      doctorUserId,
    );

    if (!organizationDoctor) {
      return null;
    }

    organizationDoctor.isActive = isActive;

    return organizationDoctor;
  }

  public async findOrganizationUser(
    organizationId: string,
    userId: string,
  ): Promise<DoctorOrganizationUserRecord | null> {
    return (
      this.organizationUsers.find(
        (user) =>
          user.organizationId === organizationId && user.userId === userId,
      ) ?? null
    );
  }

  public async createOrganizationUser(input: {
    organizationId: string;
    userId: string;
    role: OrganizationUserRole;
    isActive: boolean;
  }): Promise<DoctorOrganizationUserRecord> {
    const organizationUser = {
      id: createId(),
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role,
      isActive: input.isActive,
    };

    this.organizationUsers.push(organizationUser);

    return organizationUser;
  }

  public async updateOrganizationUserActive(
    organizationId: string,
    userId: string,
    isActive: boolean,
  ): Promise<void> {
    const organizationUser = await this.findOrganizationUser(
      organizationId,
      userId,
    );

    if (organizationUser?.role === OrganizationUserRole.DOCTOR) {
      organizationUser.isActive = isActive;
    }
  }

  public async findManyByOrganization(
    organizationId: string,
    filters: { isActive?: boolean } = {},
  ): Promise<DoctorRecord[]> {
    return this.organizationDoctors
      .filter((doctor) => doctor.organizationId === organizationId)
      .filter(
        (doctor) =>
          filters.isActive === undefined ||
          doctor.isActive === filters.isActive,
      )
      .map((doctor) => this.mapDoctor(doctor))
      .filter((doctor): doctor is DoctorRecord => doctor !== null)
      .sort((first, second) => first.lastName.localeCompare(second.lastName));
  }

  public async findByOrganizationAndDoctorId(
    organizationId: string,
    doctorUserId: string,
  ): Promise<DoctorRecord | null> {
    const organizationDoctor = await this.findOrganizationDoctor(
      organizationId,
      doctorUserId,
    );

    return organizationDoctor ? this.mapDoctor(organizationDoctor) : null;
  }

  public async findWorkingHours(
    organizationId: string,
    doctorUserId: string,
  ): Promise<DoctorWorkingHourRecord[]> {
    return this.workingHours
      .filter(
        (workingHour) =>
          workingHour.organizationId === organizationId &&
          workingHour.doctorUserId === doctorUserId,
      )
      .sort((first, second) => first.dayOfWeek - second.dayOfWeek);
  }

  public async deleteWorkingHours(
    organizationId: string,
    doctorUserId: string,
  ): Promise<void> {
    this.workingHours = this.workingHours.filter(
      (workingHour) =>
        workingHour.organizationId !== organizationId ||
        workingHour.doctorUserId !== doctorUserId,
    );
  }

  public async createWorkingHour(input: {
    organizationId: string;
    doctorUserId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isOff: boolean;
  }): Promise<DoctorWorkingHourRecord> {
    const existingWorkingHour = this.workingHours.find(
      (workingHour) =>
        workingHour.organizationId === input.organizationId &&
        workingHour.doctorUserId === input.doctorUserId &&
        workingHour.dayOfWeek === input.dayOfWeek,
    );

    if (existingWorkingHour) {
      throw {
        code: "ER_DUP_ENTRY",
        message: "Duplicate entry for key 'uq_doc_day'",
      };
    }

    const workingHour = {
      id: createId(),
      organizationId: input.organizationId,
      doctorUserId: input.doctorUserId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      isOff: input.isOff,
    };

    this.workingHours.push(workingHour);

    return workingHour;
  }

  public async createTimeOff(input: {
    organizationId: string;
    doctorUserId: string;
    startAt: Date;
    endAt: Date;
    reason: string | null;
  }): Promise<DoctorTimeOffRecord> {
    const timeOff = {
      id: TIME_OFF_ID,
      organizationId: input.organizationId,
      doctorUserId: input.doctorUserId,
      startAt: input.startAt,
      endAt: input.endAt,
      reason: input.reason,
      createdAt: CREATED_AT,
    };

    this.timeOff.push(timeOff);

    return timeOff;
  }

  public async findTimeOff(
    organizationId: string,
    doctorUserId: string,
  ): Promise<DoctorTimeOffRecord[]> {
    return this.timeOff.filter(
      (timeOff) =>
        timeOff.organizationId === organizationId &&
        timeOff.doctorUserId === doctorUserId,
    );
  }

  public async deleteTimeOff(
    organizationId: string,
    doctorUserId: string,
    timeOffId: string,
  ): Promise<boolean> {
    const initialCount = this.timeOff.length;

    this.timeOff = this.timeOff.filter(
      (timeOff) =>
        timeOff.id !== timeOffId ||
        timeOff.organizationId !== organizationId ||
        timeOff.doctorUserId !== doctorUserId,
    );

    return this.timeOff.length < initialCount;
  }

  private mapDoctor(
    organizationDoctor: OrganizationDoctorRecord,
  ): DoctorRecord | null {
    const profile = this.profiles.find(
      (doctorProfile) =>
        doctorProfile.userId === organizationDoctor.doctorUserId,
    );
    const user = this.users.find(
      (doctorUser) => doctorUser.id === organizationDoctor.doctorUserId,
    );

    if (!profile || !user) {
      return null;
    }

    return {
      id: profile.userId,
      email: user.email,
      phone: user.phone,
      userStatus: user.status,
      firstName: profile.firstName,
      lastName: profile.lastName,
      title: profile.title,
      licenseNumber: profile.licenseNumber,
      bio: profile.bio,
      isActive: organizationDoctor.isActive,
      organizationDoctorId: organizationDoctor.id,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

const createService = (repository = new InMemoryDoctorsRepository()) => {
  const service = new DoctorsService(repository, async (handler) =>
    handler(repository),
  );

  return { repository, service };
};

const seedDoctor = (
  repository: InMemoryDoctorsRepository,
  overrides: {
    id?: string;
    organizationId?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    licenseNumber?: string | null;
    isActive?: boolean;
  } = {},
): void => {
  const doctorId = overrides.id ?? DOCTOR_ID;
  const organizationId = overrides.organizationId ?? ORGANIZATION_ID;

  repository.users.push({
    id: doctorId,
    email: overrides.email ?? "doctor@example.test",
    phone: overrides.phone ?? "+385911111111",
    passwordHash: null,
    status: UserStatus.ACTIVE,
  });
  repository.profiles.push({
    userId: doctorId,
    firstName: overrides.firstName ?? "Ana",
    lastName: overrides.lastName ?? "Horvat",
    title: "dr. med.",
    licenseNumber: overrides.licenseNumber ?? "HR-123",
    bio: "Family medicine specialist.",
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  });
  repository.organizationUsers.push({
    id: createId(),
    organizationId,
    userId: doctorId,
    role: OrganizationUserRole.DOCTOR,
    isActive: overrides.isActive ?? true,
  });
  repository.organizationDoctors.push({
    id: createId(),
    organizationId,
    doctorUserId: doctorId,
    isActive: overrides.isActive ?? true,
    createdAt: CREATED_AT,
  });
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

test("creates a doctor for the current organization", async () => {
  const { repository, service } = createService();

  const doctor = await service.create(createContext(), {
    email: " Doctor@Example.test ",
    phone: " +385911111111 ",
    firstName: " Ana ",
    lastName: " Horvat ",
    title: " dr. med. ",
    licenseNumber: " HR-123 ",
    bio: " Family medicine specialist. ",
  });

  assert.equal(repository.users.length, 1);
  assert.equal(repository.profiles.length, 1);
  assert.equal(repository.organizationDoctors.length, 1);
  assert.equal(repository.organizationUsers.length, 1);
  assert.equal(
    repository.organizationDoctors[0].organizationId,
    ORGANIZATION_ID,
  );
  assert.equal(
    repository.organizationUsers[0].role,
    OrganizationUserRole.DOCTOR,
  );
  assert.equal(doctor.email, "doctor@example.test");
  assert.equal(doctor.firstName, "Ana");
  assert.equal(doctor.licenseNumber, "HR-123");
  assert.equal(doctor.isActive, true);
});

test("rejects duplicate license numbers", async () => {
  const { repository, service } = createService();

  seedDoctor(repository, {
    id: SECOND_DOCTOR_ID,
    licenseNumber: "HR-123",
  });

  await assertAppError(
    () =>
      service.create(createContext(), {
        firstName: "Ivo",
        lastName: "Ivic",
        licenseNumber: "HR-123",
      }),
    409,
    "DOCTOR_LICENSE_ALREADY_EXISTS",
  );
});

test("lists only doctors from the current organization", async () => {
  const { repository, service } = createService();

  seedDoctor(repository, {
    id: DOCTOR_ID,
    organizationId: ORGANIZATION_ID,
    lastName: "Horvat",
  });
  seedDoctor(repository, {
    id: SECOND_DOCTOR_ID,
    organizationId: SECOND_ORGANIZATION_ID,
    lastName: "Kovac",
    licenseNumber: "HR-456",
  });

  const response = await service.list(createContext());

  assert.deepEqual(
    response.doctors.map((doctor) => doctor.id),
    [DOCTOR_ID],
  );
});

test("returns not found when a doctor is outside organization scope", async () => {
  const { repository, service } = createService();

  seedDoctor(repository, {
    organizationId: SECOND_ORGANIZATION_ID,
  });

  await assertAppError(
    () => service.getById(createContext(ORGANIZATION_ID), DOCTOR_ID),
    404,
    "NOT_FOUND",
  );
});

test("updates only allowed doctor fields", async () => {
  const { repository, service } = createService();

  seedDoctor(repository);

  const payload = {
    firstName: "Anamarija",
    title: null,
    isActive: false,
    email: "changed@example.test",
  } as UpdateDoctorRequestDto;
  const doctor = await service.update(createContext(), DOCTOR_ID, payload);

  assert.equal(doctor.firstName, "Anamarija");
  assert.equal(doctor.title, null);
  assert.equal(doctor.isActive, false);
  assert.equal(doctor.email, "doctor@example.test");
  assert.equal(repository.users[0].email, "doctor@example.test");
  assert.equal(repository.organizationUsers[0].isActive, false);
});

test("rejects invalid working-hours ranges", async () => {
  const { repository, service } = createService();

  seedDoctor(repository);

  await assertAppError(
    () =>
      service.replaceWorkingHours(createContext(), DOCTOR_ID, {
        workingHours: [
          {
            dayOfWeek: 1,
            startTime: "12:00",
            endTime: "11:00",
          },
        ],
      }),
    400,
    "DOCTOR_WORKING_HOURS_INVALID_RANGE",
  );
});

test("replaces working hours without duplicating a doctor day", async () => {
  const { repository, service } = createService();

  seedDoctor(repository);

  await service.replaceWorkingHours(createContext(), DOCTOR_ID, {
    workingHours: [
      {
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "12:00",
      },
    ],
  });
  const response = await service.replaceWorkingHours(
    createContext(),
    DOCTOR_ID,
    {
      workingHours: [
        {
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "13:00",
        },
      ],
    },
  );

  assert.equal(response.workingHours.length, 1);
  assert.equal(repository.workingHours.length, 1);
  assert.equal(response.workingHours[0].dayOfWeek, 1);
  assert.equal(response.workingHours[0].startTime, "09:00:00");
});

test("rejects invalid time-off ranges", async () => {
  const { repository, service } = createService();

  seedDoctor(repository);

  await assertAppError(
    () =>
      service.createTimeOff(createContext(), DOCTOR_ID, {
        startAt: "2026-04-22T10:00:00.000Z",
        endAt: "2026-04-22T10:00:00.000Z",
      }),
    400,
    "DOCTOR_TIME_OFF_INVALID_RANGE",
  );
});

test("maps raw duplicate license database errors to stable app errors", async () => {
  const { repository, service } = createService();

  repository.failNextCreateProfileWithDuplicateLicense = true;

  await assertAppError(
    () =>
      service.create(createContext(), {
        firstName: "Maja",
        lastName: "Maric",
        licenseNumber: "HR-1",
      }),
    409,
    "DOCTOR_LICENSE_ALREADY_EXISTS",
  );
});
