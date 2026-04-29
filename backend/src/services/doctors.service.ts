import {
  type CreateDoctorRequestDto,
  type CreateDoctorTimeOffRequestDto,
  type DoctorListQueryDto,
  type DoctorListResponseDto,
  type DoctorResponseDto,
  type DoctorTimeOffListResponseDto,
  type DoctorTimeOffResponseDto,
  type DoctorWorkingHourInputDto,
  type DoctorWorkingHourResponseDto,
  type DoctorWorkingHoursResponseDto,
  OrganizationUserRole,
  type ReplaceDoctorWorkingHoursRequestDto,
  type UpdateDoctorRequestDto,
  UserStatus,
} from "@zdravstvo/contracts";

import { AppError } from "../errors/AppError.js";
import {
  DoctorsRepository,
  type UpdateDoctorProfileInput,
} from "../repositories/index.js";
import { db } from "../shared/db/index.js";
import type { AuthenticatedRequestContext } from "../shared/context/index.js";
import type {
  DoctorRecord,
  DoctorTimeOffRecord,
  DoctorUserRecord,
  DoctorWorkingHourRecord,
} from "../types/entities/index.js";

type DoctorsRequestContext = Pick<
  AuthenticatedRequestContext,
  "organizationId" | "organizationUserId" | "role"
>;

type DoctorsRepositoryContract = Pick<
  DoctorsRepository,
  | "findUserById"
  | "findUserByEmail"
  | "findUserByPhone"
  | "createUser"
  | "findDoctorProfileByUserId"
  | "findDoctorProfileByLicenseNumber"
  | "createDoctorProfile"
  | "updateDoctorProfile"
  | "findOrganizationDoctor"
  | "createOrganizationDoctor"
  | "updateOrganizationDoctorActive"
  | "findOrganizationUser"
  | "createOrganizationUser"
  | "updateOrganizationUserActive"
  | "findManyByOrganization"
  | "findByOrganizationAndDoctorId"
  | "findWorkingHours"
  | "deleteWorkingHours"
  | "createWorkingHour"
  | "createTimeOff"
  | "findTimeOff"
  | "deleteTimeOff"
>;

type DoctorsTransactionRunner = <Result>(
  handler: (repository: DoctorsRepositoryContract) => Promise<Result>,
) => Promise<Result>;

interface DatabaseErrorLike {
  code?: string;
  message?: string;
}

interface NormalizedCreateDoctorInput {
  userId?: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  title: string | null;
  licenseNumber: string | null;
  bio: string | null;
  isActive: boolean;
}

interface NormalizedWorkingHourInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

const defaultRunInTransaction: DoctorsTransactionRunner = async (handler) => {
  return db.transaction(async (transaction) =>
    handler(new DoctorsRepository(transaction)),
  );
};

const isDatabaseErrorLike = (error: unknown): error is DatabaseErrorLike => {
  return typeof error === "object" && error !== null;
};

const normalizeRequiredString = (value: string): string => {
  return value.trim();
};

const normalizeOptionalString = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeOptionalEmail = (
  value: string | null | undefined,
): string | null => {
  const normalizedValue = normalizeOptionalString(value);

  return normalizedValue ? normalizedValue.toLowerCase() : null;
};

const normalizeOptionalUpdateString = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return normalizeOptionalString(value);
};

const mapDoctorResponse = (doctor: DoctorRecord): DoctorResponseDto => {
  return {
    id: doctor.id,
    email: doctor.email,
    phone: doctor.phone,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    title: doctor.title,
    licenseNumber: doctor.licenseNumber,
    bio: doctor.bio,
    isActive: doctor.isActive,
    createdAt: doctor.createdAt.toISOString(),
    updatedAt: doctor.updatedAt.toISOString(),
  };
};

const mapWorkingHourResponse = (
  workingHour: DoctorWorkingHourRecord,
): DoctorWorkingHourResponseDto => {
  return {
    id: workingHour.id,
    doctorId: workingHour.doctorUserId,
    dayOfWeek: workingHour.dayOfWeek,
    startTime: workingHour.startTime,
    endTime: workingHour.endTime,
    isOff: workingHour.isOff,
  };
};

const mapTimeOffResponse = (
  timeOff: DoctorTimeOffRecord,
): DoctorTimeOffResponseDto => {
  return {
    id: timeOff.id,
    doctorId: timeOff.doctorUserId,
    startAt: timeOff.startAt.toISOString(),
    endAt: timeOff.endAt.toISOString(),
    reason: timeOff.reason,
    createdAt: timeOff.createdAt.toISOString(),
  };
};

const createDoctorNotFoundError = (): AppError => {
  return AppError.notFound("Doctor not found.");
};

const createLicenseConflictError = (): AppError => {
  return AppError.conflict(
    "DOCTOR_LICENSE_ALREADY_EXISTS",
    "Doctor license number is already registered.",
  );
};

const mapDoctorDatabaseError = (
  error: unknown,
  fallbackMessage: string,
): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (!isDatabaseErrorLike(error)) {
    return AppError.internal(fallbackMessage);
  }

  if (error.code !== "ER_DUP_ENTRY") {
    return AppError.internal(fallbackMessage);
  }

  const message = error.message ?? "";

  if (message.includes("uq_doctor_license")) {
    return createLicenseConflictError();
  }

  if (message.includes("uq_org_doctor")) {
    return AppError.conflict(
      "DOCTOR_ALREADY_IN_ORGANIZATION",
      "Doctor is already linked to this organization.",
    );
  }

  if (message.includes("uq_doc_day")) {
    return AppError.conflict(
      "DOCTOR_WORKING_HOURS_DAY_ALREADY_EXISTS",
      "Only one working-hours record is allowed per doctor and day.",
    );
  }

  if (message.includes("uq_users_email")) {
    return AppError.conflict(
      "EMAIL_ALREADY_EXISTS",
      "Email is already registered.",
    );
  }

  if (message.includes("uq_users_phone")) {
    return AppError.conflict(
      "PHONE_ALREADY_EXISTS",
      "Phone is already registered.",
    );
  }

  return AppError.conflict(
    "DOCTOR_CONFLICT",
    "Doctor changes conflict with existing records.",
  );
};

const normalizeCreateDoctorInput = (
  payload: CreateDoctorRequestDto,
): NormalizedCreateDoctorInput => {
  return {
    userId: payload.userId,
    email: normalizeOptionalEmail(payload.email),
    phone: normalizeOptionalString(payload.phone),
    firstName: normalizeRequiredString(payload.firstName),
    lastName: normalizeRequiredString(payload.lastName),
    title: normalizeOptionalString(payload.title),
    licenseNumber: normalizeOptionalString(payload.licenseNumber),
    bio: normalizeOptionalString(payload.bio),
    isActive: payload.isActive ?? true,
  };
};

const normalizeUpdateDoctorInput = (
  payload: UpdateDoctorRequestDto,
): UpdateDoctorProfileInput & { isActive?: boolean } => {
  return {
    firstName:
      payload.firstName === undefined
        ? undefined
        : normalizeRequiredString(payload.firstName),
    lastName:
      payload.lastName === undefined
        ? undefined
        : normalizeRequiredString(payload.lastName),
    title: normalizeOptionalUpdateString(payload.title),
    licenseNumber: normalizeOptionalUpdateString(payload.licenseNumber),
    bio: normalizeOptionalUpdateString(payload.bio),
    isActive: payload.isActive,
  };
};

const removeUndefinedValues = <Value extends object>(
  value: Value,
): Partial<Value> => {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as Partial<Value>;
};

const parseTimeToSeconds = (value: string): number => {
  const normalizedValue = value.length === 5 ? `${value}:00` : value;
  const [hours, minutes, seconds] = normalizedValue.split(":").map(Number);

  return hours * 3600 + minutes * 60 + seconds;
};

const normalizeTime = (value: string): string => {
  const trimmedValue = value.trim();

  if (!TIME_PATTERN.test(trimmedValue)) {
    throw AppError.badRequest(
      "DOCTOR_WORKING_HOURS_INVALID_TIME",
      "Working-hours time must use HH:mm or HH:mm:ss format.",
    );
  }

  return trimmedValue.length === 5 ? `${trimmedValue}:00` : trimmedValue;
};

const normalizeWorkingHourInput = (
  workingHour: DoctorWorkingHourInputDto,
): NormalizedWorkingHourInput => {
  const isOff = workingHour.isOff ?? false;

  if (
    !Number.isInteger(workingHour.dayOfWeek) ||
    workingHour.dayOfWeek < 0 ||
    workingHour.dayOfWeek > 6
  ) {
    throw AppError.badRequest(
      "DOCTOR_WORKING_HOURS_INVALID_DAY",
      "Day of week must be between 0 and 6.",
    );
  }

  if (!isOff && (!workingHour.startTime || !workingHour.endTime)) {
    throw AppError.badRequest(
      "DOCTOR_WORKING_HOURS_TIME_REQUIRED",
      "Start time and end time are required for working days.",
    );
  }

  const startTime = normalizeTime(workingHour.startTime ?? "00:00:00");
  const endTime = normalizeTime(workingHour.endTime ?? "00:00:00");

  if (!isOff && parseTimeToSeconds(startTime) >= parseTimeToSeconds(endTime)) {
    throw AppError.badRequest(
      "DOCTOR_WORKING_HOURS_INVALID_RANGE",
      "Working-hours start time must be before end time.",
    );
  }

  return {
    dayOfWeek: workingHour.dayOfWeek,
    startTime,
    endTime,
    isOff,
  };
};

const normalizeWorkingHoursInput = (
  payload: ReplaceDoctorWorkingHoursRequestDto,
): NormalizedWorkingHourInput[] => {
  const seenDays = new Set<number>();

  return payload.workingHours.map((workingHour) => {
    const normalizedWorkingHour = normalizeWorkingHourInput(workingHour);

    if (seenDays.has(normalizedWorkingHour.dayOfWeek)) {
      throw AppError.badRequest(
        "DOCTOR_WORKING_HOURS_DUPLICATE_DAY",
        "Only one working-hours record is allowed per day.",
      );
    }

    seenDays.add(normalizedWorkingHour.dayOfWeek);

    return normalizedWorkingHour;
  });
};

const parseDateTime = (value: string): Date => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest(
      "DOCTOR_TIME_OFF_INVALID_RANGE",
      "Time off start and end values must be valid date-times.",
    );
  }

  return date;
};

const normalizeTimeOffInput = (
  payload: CreateDoctorTimeOffRequestDto,
): { startAt: Date; endAt: Date; reason: string | null } => {
  const startAt = parseDateTime(payload.startAt);
  const endAt = parseDateTime(payload.endAt);

  if (startAt >= endAt) {
    throw AppError.badRequest(
      "DOCTOR_TIME_OFF_INVALID_RANGE",
      "Time off start must be before end.",
    );
  }

  return {
    startAt,
    endAt,
    reason: normalizeOptionalString(payload.reason),
  };
};

const findExistingUserByContact = async (
  repository: DoctorsRepositoryContract,
  input: Pick<NormalizedCreateDoctorInput, "email" | "phone">,
): Promise<DoctorUserRecord | null> => {
  const candidates = await Promise.all([
    input.email
      ? repository.findUserByEmail(input.email)
      : Promise.resolve(null),
    input.phone
      ? repository.findUserByPhone(input.phone)
      : Promise.resolve(null),
  ]);
  const usersById = new Map<string, DoctorUserRecord>();

  for (const candidate of candidates) {
    if (candidate) {
      usersById.set(candidate.id, candidate);
    }
  }

  if (usersById.size > 1) {
    throw AppError.conflict(
      "DOCTOR_CONTACT_MATCHES_MULTIPLE_USERS",
      "Doctor email and phone belong to different users.",
    );
  }

  return usersById.values().next().value ?? null;
};

const resolveDoctorUser = async (
  repository: DoctorsRepositoryContract,
  input: NormalizedCreateDoctorInput,
): Promise<DoctorUserRecord> => {
  if (input.userId) {
    const user = await repository.findUserById(input.userId);

    if (!user) {
      throw AppError.notFound("User not found.");
    }

    return user;
  }

  const existingUser = await findExistingUserByContact(repository, input);

  if (existingUser) {
    return existingUser;
  }

  return repository.createUser({
    email: input.email,
    phone: input.phone,
    passwordHash: null,
    status: UserStatus.ACTIVE,
  });
};

const ensureLicenseAvailable = async (
  repository: DoctorsRepositoryContract,
  licenseNumber: string | null,
  doctorUserId: string,
): Promise<void> => {
  if (!licenseNumber) {
    return;
  }

  const existingProfile =
    await repository.findDoctorProfileByLicenseNumber(licenseNumber);

  if (existingProfile && existingProfile.userId !== doctorUserId) {
    throw createLicenseConflictError();
  }
};

const ensureDoctorMembershipCanBeCreated = async (
  repository: DoctorsRepositoryContract,
  organizationId: string,
  doctorUserId: string,
): Promise<void> => {
  const [organizationDoctor, organizationUser] = await Promise.all([
    repository.findOrganizationDoctor(organizationId, doctorUserId),
    repository.findOrganizationUser(organizationId, doctorUserId),
  ]);

  if (organizationDoctor) {
    throw AppError.conflict(
      "DOCTOR_ALREADY_IN_ORGANIZATION",
      "Doctor is already linked to this organization.",
    );
  }

  if (
    organizationUser &&
    organizationUser.role !== OrganizationUserRole.DOCTOR
  ) {
    throw AppError.conflict(
      "DOCTOR_USER_ALREADY_HAS_ORGANIZATION_ROLE",
      "User already has a different role in this organization.",
    );
  }
};

export class DoctorsService {
  public constructor(
    private readonly doctorsRepository: DoctorsRepositoryContract = new DoctorsRepository(
      db,
    ),
    private readonly runInTransaction: DoctorsTransactionRunner = defaultRunInTransaction,
  ) {}

  public async create(
    context: DoctorsRequestContext,
    payload: CreateDoctorRequestDto,
  ): Promise<DoctorResponseDto> {
    const input = normalizeCreateDoctorInput(payload);

    try {
      return await this.runInTransaction(async (repository) => {
        const user = await resolveDoctorUser(repository, input);

        await ensureDoctorMembershipCanBeCreated(
          repository,
          context.organizationId,
          user.id,
        );

        const existingProfile = await repository.findDoctorProfileByUserId(
          user.id,
        );

        if (existingProfile) {
          await ensureLicenseAvailable(
            repository,
            input.licenseNumber,
            user.id,
          );
        } else {
          await ensureLicenseAvailable(
            repository,
            input.licenseNumber,
            user.id,
          );
          await repository.createDoctorProfile({
            userId: user.id,
            firstName: input.firstName,
            lastName: input.lastName,
            title: input.title,
            licenseNumber: input.licenseNumber,
            bio: input.bio,
          });
        }

        const organizationUser = await repository.findOrganizationUser(
          context.organizationId,
          user.id,
        );

        if (organizationUser) {
          await repository.updateOrganizationUserActive(
            context.organizationId,
            user.id,
            input.isActive,
          );
        } else {
          await repository.createOrganizationUser({
            organizationId: context.organizationId,
            userId: user.id,
            role: OrganizationUserRole.DOCTOR,
            isActive: input.isActive,
          });
        }

        await repository.createOrganizationDoctor({
          organizationId: context.organizationId,
          doctorUserId: user.id,
          isActive: input.isActive,
        });

        const doctor = await repository.findByOrganizationAndDoctorId(
          context.organizationId,
          user.id,
        );

        if (!doctor) {
          throw AppError.internal("Doctor creation failed.");
        }

        return mapDoctorResponse(doctor);
      });
    } catch (error: unknown) {
      throw mapDoctorDatabaseError(error, "Doctor could not be created.");
    }
  }

  public async list(
    context: DoctorsRequestContext,
    query: DoctorListQueryDto = {},
  ): Promise<DoctorListResponseDto> {
    const doctors = await this.doctorsRepository.findManyByOrganization(
      context.organizationId,
      {
        isActive: query.active,
      },
    );

    return {
      doctors: doctors.map(mapDoctorResponse),
    };
  }

  public async getById(
    context: DoctorsRequestContext,
    doctorId: string,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsRepository.findByOrganizationAndDoctorId(
      context.organizationId,
      doctorId,
    );

    if (!doctor) {
      throw createDoctorNotFoundError();
    }

    return mapDoctorResponse(doctor);
  }

  public async update(
    context: DoctorsRequestContext,
    doctorId: string,
    payload: UpdateDoctorRequestDto,
  ): Promise<DoctorResponseDto> {
    const normalizedInput = normalizeUpdateDoctorInput(payload);
    const updateInput = removeUndefinedValues(
      normalizedInput,
    ) as UpdateDoctorProfileInput & {
      isActive?: boolean;
    };
    const { isActive, ...profileInput } = updateInput;

    if (Object.keys(updateInput).length === 0) {
      throw AppError.badRequest(
        "DOCTOR_UPDATE_EMPTY",
        "At least one doctor field must be provided.",
      );
    }

    try {
      return await this.runInTransaction(async (repository) => {
        const doctor = await repository.findByOrganizationAndDoctorId(
          context.organizationId,
          doctorId,
        );

        if (!doctor) {
          throw createDoctorNotFoundError();
        }

        if (profileInput.licenseNumber !== undefined) {
          await ensureLicenseAvailable(
            repository,
            profileInput.licenseNumber,
            doctorId,
          );
        }

        if (Object.keys(profileInput).length > 0) {
          await repository.updateDoctorProfile(doctorId, profileInput);
        }

        if (isActive !== undefined) {
          await Promise.all([
            repository.updateOrganizationDoctorActive(
              context.organizationId,
              doctorId,
              isActive,
            ),
            repository.updateOrganizationUserActive(
              context.organizationId,
              doctorId,
              isActive,
            ),
          ]);
        }

        const updatedDoctor = await repository.findByOrganizationAndDoctorId(
          context.organizationId,
          doctorId,
        );

        if (!updatedDoctor) {
          throw createDoctorNotFoundError();
        }

        return mapDoctorResponse(updatedDoctor);
      });
    } catch (error: unknown) {
      throw mapDoctorDatabaseError(error, "Doctor could not be updated.");
    }
  }

  public async listWorkingHours(
    context: DoctorsRequestContext,
    doctorId: string,
  ): Promise<DoctorWorkingHoursResponseDto> {
    const doctor = await this.doctorsRepository.findByOrganizationAndDoctorId(
      context.organizationId,
      doctorId,
    );

    if (!doctor) {
      throw createDoctorNotFoundError();
    }

    const workingHours = await this.doctorsRepository.findWorkingHours(
      context.organizationId,
      doctorId,
    );

    return {
      workingHours: workingHours.map(mapWorkingHourResponse),
    };
  }

  public async replaceWorkingHours(
    context: DoctorsRequestContext,
    doctorId: string,
    payload: ReplaceDoctorWorkingHoursRequestDto,
  ): Promise<DoctorWorkingHoursResponseDto> {
    const workingHoursInput = normalizeWorkingHoursInput(payload);

    try {
      return await this.runInTransaction(async (repository) => {
        const doctor = await repository.findByOrganizationAndDoctorId(
          context.organizationId,
          doctorId,
        );

        if (!doctor) {
          throw createDoctorNotFoundError();
        }

        await repository.deleteWorkingHours(context.organizationId, doctorId);

        for (const workingHour of workingHoursInput) {
          await repository.createWorkingHour({
            organizationId: context.organizationId,
            doctorUserId: doctorId,
            dayOfWeek: workingHour.dayOfWeek,
            startTime: workingHour.startTime,
            endTime: workingHour.endTime,
            isOff: workingHour.isOff,
          });
        }

        const workingHours = await repository.findWorkingHours(
          context.organizationId,
          doctorId,
        );

        return {
          workingHours: workingHours.map(mapWorkingHourResponse),
        };
      });
    } catch (error: unknown) {
      throw mapDoctorDatabaseError(
        error,
        "Doctor working hours could not be saved.",
      );
    }
  }

  public async createTimeOff(
    context: DoctorsRequestContext,
    doctorId: string,
    payload: CreateDoctorTimeOffRequestDto,
  ): Promise<DoctorTimeOffResponseDto> {
    const timeOffInput = normalizeTimeOffInput(payload);

    try {
      const doctor = await this.doctorsRepository.findByOrganizationAndDoctorId(
        context.organizationId,
        doctorId,
      );

      if (!doctor) {
        throw createDoctorNotFoundError();
      }

      const timeOff = await this.doctorsRepository.createTimeOff({
        organizationId: context.organizationId,
        doctorUserId: doctorId,
        startAt: timeOffInput.startAt,
        endAt: timeOffInput.endAt,
        reason: timeOffInput.reason,
      });

      return mapTimeOffResponse(timeOff);
    } catch (error: unknown) {
      throw mapDoctorDatabaseError(
        error,
        "Doctor time off could not be saved.",
      );
    }
  }

  public async listTimeOff(
    context: DoctorsRequestContext,
    doctorId: string,
  ): Promise<DoctorTimeOffListResponseDto> {
    const doctor = await this.doctorsRepository.findByOrganizationAndDoctorId(
      context.organizationId,
      doctorId,
    );

    if (!doctor) {
      throw createDoctorNotFoundError();
    }

    const timeOff = await this.doctorsRepository.findTimeOff(
      context.organizationId,
      doctorId,
    );

    return {
      timeOff: timeOff.map(mapTimeOffResponse),
    };
  }

  public async deleteTimeOff(
    context: DoctorsRequestContext,
    doctorId: string,
    timeOffId: string,
  ): Promise<void> {
    const doctor = await this.doctorsRepository.findByOrganizationAndDoctorId(
      context.organizationId,
      doctorId,
    );

    if (!doctor) {
      throw createDoctorNotFoundError();
    }

    const wasDeleted = await this.doctorsRepository.deleteTimeOff(
      context.organizationId,
      doctorId,
      timeOffId,
    );

    if (!wasDeleted) {
      throw AppError.notFound("Doctor time off not found.");
    }
  }
}

export const doctorsService = new DoctorsService();
