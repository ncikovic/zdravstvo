import { OrganizationUserRole, UserStatus } from "@zdravstvo/contracts";
import { v4 as uuidv4 } from "uuid";

import type { DatabaseExecutor } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";
import type {
  DoctorOrganizationUserRecord,
  DoctorProfileRecord,
  DoctorRecord,
  DoctorTimeOffRecord,
  DoctorUserRecord,
  DoctorWorkingHourRecord,
  OrganizationDoctorRecord,
} from "../types/entities/index.js";

export interface CreateDoctorUserInput {
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  status: UserStatus;
}

export interface CreateDoctorProfileInput {
  userId: string;
  firstName: string;
  lastName: string;
  title: string | null;
  licenseNumber: string | null;
  bio: string | null;
}

export interface UpdateDoctorProfileInput {
  firstName?: string;
  lastName?: string;
  title?: string | null;
  licenseNumber?: string | null;
  bio?: string | null;
}

export interface CreateOrganizationDoctorInput {
  organizationId: string;
  doctorUserId: string;
  isActive: boolean;
}

export interface CreateDoctorOrganizationUserInput {
  organizationId: string;
  userId: string;
  role: OrganizationUserRole;
  isActive: boolean;
}

export interface CreateDoctorWorkingHourInput {
  organizationId: string;
  doctorUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface CreateDoctorTimeOffInput {
  organizationId: string;
  doctorUserId: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
}

interface DoctorUserRow {
  id: Buffer;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  status: UserStatus;
}

interface DoctorProfileRow {
  user_id: Buffer;
  first_name: string;
  last_name: string;
  title: string | null;
  license_number: string | null;
  bio: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

interface OrganizationDoctorRow {
  id: Buffer;
  organization_id: Buffer;
  doctor_user_id: Buffer;
  is_active: number | boolean;
  created_at: Date | string;
}

interface DoctorOrganizationUserRow {
  id: Buffer;
  organization_id: Buffer;
  user_id: Buffer;
  role: OrganizationUserRole;
  is_active: number | boolean;
}

interface DoctorRow {
  user_id: Buffer;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  first_name: string;
  last_name: string;
  title: string | null;
  license_number: string | null;
  bio: string | null;
  profile_created_at: Date | string;
  profile_updated_at: Date | string;
  organization_doctor_id: Buffer;
  is_active: number | boolean;
}

interface DoctorWorkingHourRow {
  id: Buffer;
  organization_id: Buffer;
  doctor_user_id: Buffer;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_off: number | boolean;
}

interface DoctorTimeOffRow {
  id: Buffer;
  organization_id: Buffer;
  doctor_user_id: Buffer;
  start_at: Date | string;
  end_at: Date | string;
  reason: string | null;
  created_at: Date | string;
}

const DOCTOR_COLUMNS = [
  "doctor.user_id as user_id",
  "user.email as email",
  "user.phone as phone",
  "user.status as status",
  "doctor.first_name as first_name",
  "doctor.last_name as last_name",
  "doctor.title as title",
  "doctor.license_number as license_number",
  "doctor.bio as bio",
  "doctor.created_at as profile_created_at",
  "doctor.updated_at as profile_updated_at",
  "organizationDoctor.id as organization_doctor_id",
  "organizationDoctor.is_active as is_active",
] as const;

const DOCTOR_PROFILE_COLUMNS = [
  "user_id",
  "first_name",
  "last_name",
  "title",
  "license_number",
  "bio",
  "created_at",
  "updated_at",
] as const;

const ORGANIZATION_DOCTOR_COLUMNS = [
  "id",
  "organization_id",
  "doctor_user_id",
  "is_active",
  "created_at",
] as const;

const DOCTOR_WORKING_HOUR_COLUMNS = [
  "id",
  "organization_id",
  "doctor_user_id",
  "day_of_week",
  "start_time",
  "end_time",
  "is_off",
] as const;

const DOCTOR_TIME_OFF_COLUMNS = [
  "id",
  "organization_id",
  "doctor_user_id",
  "start_at",
  "end_at",
  "reason",
  "created_at",
] as const;

const mapDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

const mapDoctorUserRecord = (row: DoctorUserRow): DoctorUserRecord => {
  return {
    id: bufferToUuid(row.id),
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    status: row.status,
  };
};

const mapDoctorProfileRecord = (row: DoctorProfileRow): DoctorProfileRecord => {
  return {
    userId: bufferToUuid(row.user_id),
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    licenseNumber: row.license_number,
    bio: row.bio,
    createdAt: mapDate(row.created_at),
    updatedAt: mapDate(row.updated_at),
  };
};

const mapOrganizationDoctorRecord = (
  row: OrganizationDoctorRow,
): OrganizationDoctorRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    isActive: Boolean(row.is_active),
    createdAt: mapDate(row.created_at),
  };
};

const mapDoctorOrganizationUserRecord = (
  row: DoctorOrganizationUserRow,
): DoctorOrganizationUserRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    userId: bufferToUuid(row.user_id),
    role: row.role,
    isActive: Boolean(row.is_active),
  };
};

const mapDoctorRecord = (row: DoctorRow): DoctorRecord => {
  return {
    id: bufferToUuid(row.user_id),
    email: row.email,
    phone: row.phone,
    userStatus: row.status,
    firstName: row.first_name,
    lastName: row.last_name,
    title: row.title,
    licenseNumber: row.license_number,
    bio: row.bio,
    isActive: Boolean(row.is_active),
    organizationDoctorId: bufferToUuid(row.organization_doctor_id),
    createdAt: mapDate(row.profile_created_at),
    updatedAt: mapDate(row.profile_updated_at),
  };
};

const mapDoctorWorkingHourRecord = (
  row: DoctorWorkingHourRow,
): DoctorWorkingHourRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    isOff: Boolean(row.is_off),
  };
};

const mapDoctorTimeOffRecord = (row: DoctorTimeOffRow): DoctorTimeOffRecord => {
  return {
    id: bufferToUuid(row.id),
    organizationId: bufferToUuid(row.organization_id),
    doctorUserId: bufferToUuid(row.doctor_user_id),
    startAt: mapDate(row.start_at),
    endAt: mapDate(row.end_at),
    reason: row.reason,
    createdAt: mapDate(row.created_at),
  };
};

export class DoctorsRepository {
  public constructor(private readonly executor: DatabaseExecutor) {}

  public async findUserById(userId: string): Promise<DoctorUserRecord | null> {
    const row = await this.executor<DoctorUserRow>("users")
      .select("id", "email", "phone", "password_hash", "status")
      .where({ id: uuidToBuffer(userId) })
      .first();

    return row ? mapDoctorUserRecord(row) : null;
  }

  public async findUserByEmail(
    email: string,
  ): Promise<DoctorUserRecord | null> {
    const row = await this.executor<DoctorUserRow>("users")
      .select("id", "email", "phone", "password_hash", "status")
      .where({ email })
      .first();

    return row ? mapDoctorUserRecord(row) : null;
  }

  public async findUserByPhone(
    phone: string,
  ): Promise<DoctorUserRecord | null> {
    const row = await this.executor<DoctorUserRow>("users")
      .select("id", "email", "phone", "password_hash", "status")
      .where({ phone })
      .first();

    return row ? mapDoctorUserRecord(row) : null;
  }

  public async createUser(
    input: CreateDoctorUserInput,
  ): Promise<DoctorUserRecord> {
    const id = uuidv4();

    await this.executor("users").insert({
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

  public async findDoctorProfileByUserId(
    userId: string,
  ): Promise<DoctorProfileRecord | null> {
    const row = await this.executor<DoctorProfileRow>("doctor_profiles")
      .select(...DOCTOR_PROFILE_COLUMNS)
      .where({ user_id: uuidToBuffer(userId) })
      .first();

    return row ? mapDoctorProfileRecord(row) : null;
  }

  public async findDoctorProfileByLicenseNumber(
    licenseNumber: string,
  ): Promise<DoctorProfileRecord | null> {
    const row = await this.executor<DoctorProfileRow>("doctor_profiles")
      .select(...DOCTOR_PROFILE_COLUMNS)
      .where({ license_number: licenseNumber })
      .first();

    return row ? mapDoctorProfileRecord(row) : null;
  }

  public async createDoctorProfile(
    input: CreateDoctorProfileInput,
  ): Promise<DoctorProfileRecord> {
    await this.executor("doctor_profiles").insert({
      user_id: uuidToBuffer(input.userId),
      first_name: input.firstName,
      last_name: input.lastName,
      title: input.title,
      license_number: input.licenseNumber,
      bio: input.bio,
    });

    const profile = await this.findDoctorProfileByUserId(input.userId);

    if (!profile) {
      throw new Error("Doctor profile creation failed.");
    }

    return profile;
  }

  public async updateDoctorProfile(
    doctorUserId: string,
    input: UpdateDoctorProfileInput,
  ): Promise<DoctorProfileRecord | null> {
    const updateValues: Record<string, string | null> = {};

    if (input.firstName !== undefined) {
      updateValues.first_name = input.firstName;
    }

    if (input.lastName !== undefined) {
      updateValues.last_name = input.lastName;
    }

    if (input.title !== undefined) {
      updateValues.title = input.title;
    }

    if (input.licenseNumber !== undefined) {
      updateValues.license_number = input.licenseNumber;
    }

    if (input.bio !== undefined) {
      updateValues.bio = input.bio;
    }

    await this.executor("doctor_profiles")
      .where({ user_id: uuidToBuffer(doctorUserId) })
      .update(updateValues);

    return this.findDoctorProfileByUserId(doctorUserId);
  }

  public async findOrganizationDoctor(
    organizationId: string,
    doctorUserId: string,
  ): Promise<OrganizationDoctorRecord | null> {
    const row = await this.executor<OrganizationDoctorRow>(
      "organization_doctors",
    )
      .select(...ORGANIZATION_DOCTOR_COLUMNS)
      .where({
        organization_id: uuidToBuffer(organizationId),
        doctor_user_id: uuidToBuffer(doctorUserId),
      })
      .first();

    return row ? mapOrganizationDoctorRecord(row) : null;
  }

  public async createOrganizationDoctor(
    input: CreateOrganizationDoctorInput,
  ): Promise<OrganizationDoctorRecord> {
    const id = uuidv4();

    await this.executor("organization_doctors").insert({
      id: uuidToBuffer(id),
      organization_id: uuidToBuffer(input.organizationId),
      doctor_user_id: uuidToBuffer(input.doctorUserId),
      is_active: input.isActive,
    });

    const record = await this.findOrganizationDoctor(
      input.organizationId,
      input.doctorUserId,
    );

    if (!record) {
      throw new Error("Organization doctor creation failed.");
    }

    return record;
  }

  public async updateOrganizationDoctorActive(
    organizationId: string,
    doctorUserId: string,
    isActive: boolean,
  ): Promise<OrganizationDoctorRecord | null> {
    await this.executor("organization_doctors")
      .where({
        organization_id: uuidToBuffer(organizationId),
        doctor_user_id: uuidToBuffer(doctorUserId),
      })
      .update({ is_active: isActive });

    return this.findOrganizationDoctor(organizationId, doctorUserId);
  }

  public async findOrganizationUser(
    organizationId: string,
    userId: string,
  ): Promise<DoctorOrganizationUserRecord | null> {
    const row = await this.executor<DoctorOrganizationUserRow>(
      "organization_users",
    )
      .select("id", "organization_id", "user_id", "role", "is_active")
      .where({
        organization_id: uuidToBuffer(organizationId),
        user_id: uuidToBuffer(userId),
      })
      .first();

    return row ? mapDoctorOrganizationUserRecord(row) : null;
  }

  public async createOrganizationUser(
    input: CreateDoctorOrganizationUserInput,
  ): Promise<DoctorOrganizationUserRecord> {
    const id = uuidv4();

    await this.executor("organization_users").insert({
      id: uuidToBuffer(id),
      organization_id: uuidToBuffer(input.organizationId),
      user_id: uuidToBuffer(input.userId),
      role: input.role,
      is_active: input.isActive,
    });

    const membership = await this.findOrganizationUser(
      input.organizationId,
      input.userId,
    );

    if (!membership) {
      throw new Error("Doctor organization user creation failed.");
    }

    return membership;
  }

  public async updateOrganizationUserActive(
    organizationId: string,
    userId: string,
    isActive: boolean,
  ): Promise<void> {
    await this.executor("organization_users")
      .where({
        organization_id: uuidToBuffer(organizationId),
        user_id: uuidToBuffer(userId),
        role: OrganizationUserRole.DOCTOR,
      })
      .update({ is_active: isActive });
  }

  public async findManyByOrganization(
    organizationId: string,
    filters: { isActive?: boolean } = {},
  ): Promise<DoctorRecord[]> {
    const query = this.executor<DoctorRow>(
      "organization_doctors as organizationDoctor",
    )
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "organizationDoctor.doctor_user_id",
      )
      .innerJoin("users as user", "user.id", "doctor.user_id")
      .select(...DOCTOR_COLUMNS)
      .where(
        "organizationDoctor.organization_id",
        uuidToBuffer(organizationId),
      );

    if (filters.isActive !== undefined) {
      query.andWhere("organizationDoctor.is_active", filters.isActive ? 1 : 0);
    }

    const rows = await query
      .orderBy("doctor.last_name", "asc")
      .orderBy("doctor.first_name", "asc")
      .orderBy("doctor.user_id", "asc");

    return rows.map(mapDoctorRecord);
  }

  public async findByOrganizationAndDoctorId(
    organizationId: string,
    doctorUserId: string,
  ): Promise<DoctorRecord | null> {
    const row = await this.executor<DoctorRow>(
      "organization_doctors as organizationDoctor",
    )
      .innerJoin(
        "doctor_profiles as doctor",
        "doctor.user_id",
        "organizationDoctor.doctor_user_id",
      )
      .innerJoin("users as user", "user.id", "doctor.user_id")
      .select(...DOCTOR_COLUMNS)
      .where("organizationDoctor.organization_id", uuidToBuffer(organizationId))
      .andWhere("organizationDoctor.doctor_user_id", uuidToBuffer(doctorUserId))
      .first();

    return row ? mapDoctorRecord(row) : null;
  }

  public async findWorkingHours(
    organizationId: string,
    doctorUserId: string,
  ): Promise<DoctorWorkingHourRecord[]> {
    const rows = await this.executor<DoctorWorkingHourRow>(
      "doctor_working_hours",
    )
      .select(...DOCTOR_WORKING_HOUR_COLUMNS)
      .where({
        organization_id: uuidToBuffer(organizationId),
        doctor_user_id: uuidToBuffer(doctorUserId),
      })
      .orderBy("day_of_week", "asc");

    return rows.map(mapDoctorWorkingHourRecord);
  }

  public async deleteWorkingHours(
    organizationId: string,
    doctorUserId: string,
  ): Promise<void> {
    await this.executor("doctor_working_hours")
      .where({
        organization_id: uuidToBuffer(organizationId),
        doctor_user_id: uuidToBuffer(doctorUserId),
      })
      .delete();
  }

  public async createWorkingHour(
    input: CreateDoctorWorkingHourInput,
  ): Promise<DoctorWorkingHourRecord> {
    const id = uuidv4();

    await this.executor("doctor_working_hours").insert({
      id: uuidToBuffer(id),
      organization_id: uuidToBuffer(input.organizationId),
      doctor_user_id: uuidToBuffer(input.doctorUserId),
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      is_off: input.isOff,
    });

    const rows = await this.findWorkingHours(
      input.organizationId,
      input.doctorUserId,
    );
    const workingHour = rows.find((row) => row.id === id);

    if (!workingHour) {
      throw new Error("Doctor working hour creation failed.");
    }

    return workingHour;
  }

  public async createTimeOff(
    input: CreateDoctorTimeOffInput,
  ): Promise<DoctorTimeOffRecord> {
    const id = uuidv4();

    await this.executor("doctor_time_off").insert({
      id: uuidToBuffer(id),
      organization_id: uuidToBuffer(input.organizationId),
      doctor_user_id: uuidToBuffer(input.doctorUserId),
      start_at: input.startAt,
      end_at: input.endAt,
      reason: input.reason,
    });

    const row = await this.executor<DoctorTimeOffRow>("doctor_time_off")
      .select(...DOCTOR_TIME_OFF_COLUMNS)
      .where({ id: uuidToBuffer(id) })
      .first();

    if (!row) {
      throw new Error("Doctor time off creation failed.");
    }

    return mapDoctorTimeOffRecord(row);
  }

  public async findTimeOff(
    organizationId: string,
    doctorUserId: string,
  ): Promise<DoctorTimeOffRecord[]> {
    const rows = await this.executor<DoctorTimeOffRow>("doctor_time_off")
      .select(...DOCTOR_TIME_OFF_COLUMNS)
      .where({
        organization_id: uuidToBuffer(organizationId),
        doctor_user_id: uuidToBuffer(doctorUserId),
      })
      .orderBy("start_at", "asc")
      .orderBy("id", "asc");

    return rows.map(mapDoctorTimeOffRecord);
  }

  public async deleteTimeOff(
    organizationId: string,
    doctorUserId: string,
    timeOffId: string,
  ): Promise<boolean> {
    const deletedCount = await this.executor("doctor_time_off")
      .where({
        id: uuidToBuffer(timeOffId),
        organization_id: uuidToBuffer(organizationId),
        doctor_user_id: uuidToBuffer(doctorUserId),
      })
      .delete();

    return deletedCount > 0;
  }
}
