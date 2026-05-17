import {
  type AppointmentAvailableSlotDto,
  type AppointmentAvailableSlotListResponseDto,
  type AppointmentListQueryDto,
  type AppointmentListResponseDto,
  type AppointmentResponseDto,
  type AvailableAppointmentSlotsQueryDto,
  type CancelAppointmentRequestDto,
  type CreateAppointmentRequestDto,
  OrganizationUserRole,
  type UpdateAppointmentScheduleRequestDto,
} from "@zdravstvo/contracts";
import type { Knex } from "knex";

import { AppError } from "../errors/AppError.js";
import {
  AppointmentsRepository,
  type CreateAppointmentInput,
  type FindAppointmentsInput,
  type UpdateAppointmentScheduleInput,
} from "../repositories/index.js";
import type { AuthenticatedRequestContext } from "../shared/context/index.js";
import { db } from "../shared/db/index.js";
import type {
  AppointmentConflictRecord,
  AppointmentDoctorRecord,
  AppointmentOrganizationRecord,
  AppointmentRecord,
  AppointmentTimeOffRecord,
  AppointmentTypeRecord,
  AppointmentWorkingHourRecord,
} from "../types/entities/index.js";

type AppointmentsRequestContext = Pick<
  AuthenticatedRequestContext,
  "organizationId" | "organizationUserId" | "role" | "userId"
>;

type AppointmentsRepositoryContract = Pick<
  AppointmentsRepository,
  | "findOrganization"
  | "findDoctorInOrganization"
  | "findActiveDoctors"
  | "findPatientInOrganization"
  | "findAppointmentType"
  | "findWorkingHour"
  | "findWorkingHoursForDoctors"
  | "findTimeOffOverlaps"
  | "findTimeOffForDoctors"
  | "findConflictingAppointments"
  | "findAppointmentsForDoctors"
  | "lockDoctorSchedule"
  | "lockPatientSchedule"
  | "findById"
  | "findMany"
  | "countMany"
  | "createAppointment"
  | "updateSchedule"
  | "cancelAppointment"
>;

type AppointmentsTransactionRunner = <Result>(
  handler: (repository: AppointmentsRepositoryContract) => Promise<Result>,
) => Promise<Result>;

interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
}

interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

interface DayWindow {
  start: Date;
  end: Date;
}

interface AppointmentTiming {
  startAt: Date;
  endAt: Date;
}

interface ResolvedSchedulingContext {
  organization: AppointmentOrganizationRecord;
  doctor: AppointmentDoctorRecord;
  appointmentType: AppointmentTypeRecord;
}

interface AvailabilityContext {
  organization: AppointmentOrganizationRecord;
  appointmentType: AppointmentTypeRecord;
  doctors: AppointmentDoctorRecord[];
}

const DEFAULT_TIMEZONE = "Europe/Zagreb";
const DEFAULT_LIST_LIMIT = 100;
const PAGE_SIZE = 10;
const DEFAULT_SLOT_LIMIT = 100;
const MAX_APPOINTMENT_DURATION_MINUTES = 8 * 60;
const SCHEDULING_ROLES: readonly OrganizationUserRole[] = [
  OrganizationUserRole.ADMIN,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
  OrganizationUserRole.PATIENT,
];
const MANAGER_ROLES: readonly OrganizationUserRole[] = [
  OrganizationUserRole.ADMIN,
  OrganizationUserRole.RECEPTION,
];

const defaultRunInTransaction: AppointmentsTransactionRunner = async (
  handler,
) => {
  return db.transaction(async (transaction: Knex.Transaction) =>
    handler(new AppointmentsRepository(transaction)),
  );
};

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

const getDateTimeFormatter = (timeZone: string): Intl.DateTimeFormat => {
  const existingFormatter = dateTimeFormatters.get(timeZone);

  if (existingFormatter) {
    return existingFormatter;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  dateTimeFormatters.set(timeZone, formatter);

  return formatter;
};

const getDateFormatter = (timeZone: string): Intl.DateTimeFormat => {
  const existingFormatter = dateFormatters.get(timeZone);

  if (existingFormatter) {
    return existingFormatter;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  dateFormatters.set(timeZone, formatter);

  return formatter;
};

const readFormattedPart = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): number => {
  const value = parts.find((part) => part.type === type)?.value;

  return Number(value ?? 0);
};

const getZonedDateParts = (date: Date, timeZone: string): ZonedDateParts => {
  const parts = getDateFormatter(timeZone).formatToParts(date);

  return {
    year: readFormattedPart(parts, "year"),
    month: readFormattedPart(parts, "month"),
    day: readFormattedPart(parts, "day"),
  };
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string): number => {
  const parts = getDateTimeFormatter(timeZone).formatToParts(date);
  const localAsUtc = Date.UTC(
    readFormattedPart(parts, "year"),
    readFormattedPart(parts, "month") - 1,
    readFormattedPart(parts, "day"),
    readFormattedPart(parts, "hour"),
    readFormattedPart(parts, "minute"),
    readFormattedPart(parts, "second"),
  );

  return localAsUtc - date.getTime();
};

const zonedTimeToUtc = (
  dateParts: ZonedDateParts,
  timeZone: string,
  timeParts: TimeParts = { hours: 0, minutes: 0, seconds: 0 },
): Date => {
  const utcGuess = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    timeParts.seconds,
  );
  const firstOffset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const firstResult = utcGuess - firstOffset;
  const secondOffset = getTimeZoneOffsetMs(new Date(firstResult), timeZone);

  return new Date(utcGuess - secondOffset);
};

const addLocalDays = (
  dateParts: ZonedDateParts,
  days: number,
): ZonedDateParts => {
  const date = new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day + days),
  );

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
};

const parseDateOnlyParts = (date: string): ZonedDateParts => {
  const [year = "0", month = "0", day = "0"] = date.split("-");

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
};

const parseTimeParts = (value: string): TimeParts => {
  const [hours = "0", minutes = "0", seconds = "0"] = value
    .split(":")
    .map((part) => part.trim());

  return {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
  };
};

const createDayWindowFromParts = (
  dateParts: ZonedDateParts,
  timeZone: string,
): DayWindow => {
  return {
    start: zonedTimeToUtc(dateParts, timeZone),
    end: zonedTimeToUtc(addLocalDays(dateParts, 1), timeZone),
  };
};

const combineLocalDateAndTime = (
  dateParts: ZonedDateParts,
  timeZone: string,
  time: string,
): Date => {
  return zonedTimeToUtc(dateParts, timeZone, parseTimeParts(time));
};

const getDayOfWeek = (dateParts: ZonedDateParts): number => {
  return new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day),
  ).getUTCDay();
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

const getDurationMinutes = (startAt: Date, endAt: Date): number => {
  return (endAt.getTime() - startAt.getTime()) / 60000;
};

const overlaps = (
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean => {
  return firstStart < secondEnd && firstEnd > secondStart;
};

const parseDateTime = (value: string, code: string): Date => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest(
      code,
      "Date-time value must be valid ISO string.",
    );
  }

  return date;
};

const normalizeNotes = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
};

const toDateOnlyIso = (date: Date | null): string | null => {
  return date ? date.toISOString().slice(0, 10) : null;
};

const isManagerRole = (role: OrganizationUserRole): boolean => {
  return MANAGER_ROLES.includes(role);
};

const ensureSchedulingRole = (role: OrganizationUserRole): void => {
  if (!SCHEDULING_ROLES.includes(role)) {
    throw AppError.forbidden();
  }
};

const mapAppointmentResponse = (
  appointment: AppointmentRecord,
): AppointmentResponseDto => {
  return {
    id: appointment.id,
    organizationId: appointment.organizationId,
    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),
    status: appointment.status,
    notes: appointment.notes,
    cancellationReason: appointment.cancellationReason,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    doctor: {
      id: appointment.doctor.id,
      firstName: appointment.doctor.firstName,
      lastName: appointment.doctor.lastName,
      title: appointment.doctor.title,
    },
    patient: {
      id: appointment.patient.id,
      firstName: appointment.patient.firstName,
      lastName: appointment.patient.lastName,
      dateOfBirth: toDateOnlyIso(appointment.patient.dateOfBirth),
      oib: appointment.patient.oib,
    },
    appointmentType: {
      id: appointment.appointmentType.id,
      name: appointment.appointmentType.name,
      defaultDurationMinutes:
        appointment.appointmentType.defaultDurationMinutes,
    },
  };
};

const createTiming = (
  startAtValue: string,
  endAtValue: string | undefined,
  defaultDurationMinutes: number,
): AppointmentTiming => {
  const startAt = parseDateTime(startAtValue, "APPOINTMENT_INVALID_START_AT");
  const endAt = endAtValue
    ? parseDateTime(endAtValue, "APPOINTMENT_INVALID_END_AT")
    : addMinutes(startAt, defaultDurationMinutes);

  validateTiming({ startAt, endAt });

  return { startAt, endAt };
};

const validateTiming = (timing: AppointmentTiming): void => {
  if (timing.startAt >= timing.endAt) {
    throw AppError.badRequest(
      "APPOINTMENT_INVALID_TIME_RANGE",
      "Appointment start must be before appointment end.",
    );
  }

  if (
    getDurationMinutes(timing.startAt, timing.endAt) >
    MAX_APPOINTMENT_DURATION_MINUTES
  ) {
    throw AppError.badRequest(
      "APPOINTMENT_DURATION_TOO_LONG",
      "Appointment duration cannot exceed eight hours.",
    );
  }
};

const ensureNotPast = (timing: AppointmentTiming, now: Date): void => {
  if (timing.startAt < now) {
    throw AppError.badRequest(
      "APPOINTMENT_IN_PAST",
      "Appointment cannot be scheduled in the past.",
    );
  }
};

const ensureAppointmentIsVisible = (
  context: AppointmentsRequestContext,
  appointment: AppointmentRecord,
): void => {
  if (isManagerRole(context.role)) {
    return;
  }

  if (
    context.role === OrganizationUserRole.DOCTOR &&
    appointment.doctor.id === context.userId
  ) {
    return;
  }

  if (
    context.role === OrganizationUserRole.PATIENT &&
    appointment.patient.id === context.userId
  ) {
    return;
  }

  throw AppError.forbidden();
};

const ensureCreateAccess = (
  context: AppointmentsRequestContext,
  payload: CreateAppointmentRequestDto,
): void => {
  ensureSchedulingRole(context.role);

  if (isManagerRole(context.role)) {
    return;
  }

  if (
    context.role === OrganizationUserRole.DOCTOR &&
    payload.doctorId === context.userId
  ) {
    return;
  }

  if (
    context.role === OrganizationUserRole.PATIENT &&
    payload.patientId === context.userId
  ) {
    return;
  }

  throw AppError.forbidden();
};

const ensureUpdateAccess = (
  context: AppointmentsRequestContext,
  appointment: AppointmentRecord,
): void => {
  ensureAppointmentIsVisible(context, appointment);
};

const buildListFilters = (
  context: AppointmentsRequestContext,
  query: AppointmentListQueryDto,
): FindAppointmentsInput => {
  const isPaginated = query.page !== undefined;
  const page = query.page ?? 1;
  const limit = isPaginated ? PAGE_SIZE : (query.limit ?? DEFAULT_LIST_LIMIT);
  const offset = isPaginated ? (page - 1) * PAGE_SIZE : 0;

  const filters: FindAppointmentsInput = {
    organizationId: context.organizationId,
    limit,
    offset,
  };

  if (query.startAt) {
    filters.startAt = parseDateTime(
      query.startAt,
      "APPOINTMENT_INVALID_START_AT",
    );
  }

  if (query.endAt) {
    filters.endAt = parseDateTime(query.endAt, "APPOINTMENT_INVALID_END_AT");
  }

  if (filters.startAt && filters.endAt && filters.startAt >= filters.endAt) {
    throw AppError.badRequest(
      "APPOINTMENT_INVALID_TIME_RANGE",
      "Appointment list start must be before end.",
    );
  }

  if (query.appointmentTypeId) {
    filters.appointmentTypeId = query.appointmentTypeId;
  }

  if (query.status) {
    filters.status = query.status;
  }

  const search = query.search?.trim();

  if (search) {
    filters.search = search;
  }

  if (isManagerRole(context.role)) {
    filters.doctorUserId = query.doctorId;
    filters.patientUserId = query.patientId;
    return filters;
  }

  if (context.role === OrganizationUserRole.DOCTOR) {
    if (query.doctorId && query.doctorId !== context.userId) {
      throw AppError.forbidden();
    }

    filters.doctorUserId = context.userId;
    filters.patientUserId = query.patientId;
    return filters;
  }

  if (context.role === OrganizationUserRole.PATIENT) {
    if (query.patientId && query.patientId !== context.userId) {
      throw AppError.forbidden();
    }

    filters.patientUserId = context.userId;
    filters.doctorUserId = query.doctorId;
    return filters;
  }

  throw AppError.forbidden();
};

const resolveSchedulingContext = async (
  repository: AppointmentsRepositoryContract,
  organizationId: string,
  doctorId: string,
  appointmentTypeId: string,
): Promise<ResolvedSchedulingContext> => {
  const [organization, doctor, appointmentType] = await Promise.all([
    repository.findOrganization(organizationId),
    repository.findDoctorInOrganization(organizationId, doctorId),
    repository.findAppointmentType(organizationId, appointmentTypeId),
  ]);

  if (!organization) {
    throw AppError.notFound("Organization not found.");
  }

  if (!doctor || !doctor.isActive) {
    throw AppError.notFound("Active doctor not found in organization.");
  }

  if (!appointmentType || !appointmentType.isActive) {
    throw AppError.notFound("Active appointment type not found.");
  }

  return { organization, doctor, appointmentType };
};

const ensurePatientExists = async (
  repository: AppointmentsRepositoryContract,
  organizationId: string,
  patientId: string,
): Promise<void> => {
  const patient = await repository.findPatientInOrganization(
    organizationId,
    patientId,
  );

  if (!patient) {
    throw AppError.notFound("Active patient not found in organization.");
  }
};

const ensureWithinWorkingHours = async (
  repository: AppointmentsRepositoryContract,
  organizationId: string,
  organizationTimeZone: string,
  doctorId: string,
  timing: AppointmentTiming,
): Promise<void> => {
  const dateParts = getZonedDateParts(timing.startAt, organizationTimeZone);
  const workingHour = await repository.findWorkingHour(
    organizationId,
    doctorId,
    getDayOfWeek(dateParts),
  );

  if (!workingHour || workingHour.isOff) {
    throw AppError.conflict(
      "APPOINTMENT_DOCTOR_NOT_WORKING",
      "Doctor is not working at the requested time.",
    );
  }

  const workStart = combineLocalDateAndTime(
    dateParts,
    organizationTimeZone,
    workingHour.startTime,
  );
  const workEnd = combineLocalDateAndTime(
    dateParts,
    organizationTimeZone,
    workingHour.endTime,
  );

  if (timing.startAt < workStart || timing.endAt > workEnd) {
    throw AppError.conflict(
      "APPOINTMENT_OUTSIDE_WORKING_HOURS",
      "Appointment must fit inside doctor working hours.",
    );
  }
};

const ensureNoTimeOffOverlap = async (
  repository: AppointmentsRepositoryContract,
  organizationId: string,
  doctorId: string,
  timing: AppointmentTiming,
): Promise<void> => {
  const overlapsTimeOff = await repository.findTimeOffOverlaps(
    organizationId,
    doctorId,
    timing.startAt,
    timing.endAt,
  );

  if (overlapsTimeOff.length > 0) {
    throw AppError.conflict(
      "APPOINTMENT_DOCTOR_TIME_OFF_CONFLICT",
      "Appointment overlaps with doctor time off.",
    );
  }
};

const ensureNoAppointmentConflict = async (
  repository: AppointmentsRepositoryContract,
  input: {
    organizationId: string;
    doctorId: string;
    patientId: string;
    timing: AppointmentTiming;
    excludeAppointmentId?: string;
  },
): Promise<void> => {
  const conflicts = await repository.findConflictingAppointments({
    organizationId: input.organizationId,
    doctorUserId: input.doctorId,
    patientUserId: input.patientId,
    startAt: input.timing.startAt,
    endAt: input.timing.endAt,
    excludeAppointmentId: input.excludeAppointmentId,
    lockForUpdate: true,
  });

  const doctorConflict = conflicts.find(
    (conflict) => conflict.doctorUserId === input.doctorId,
  );

  if (doctorConflict) {
    throw AppError.conflict(
      "APPOINTMENT_DOCTOR_CONFLICT",
      "Doctor already has a scheduled appointment in the requested time range.",
    );
  }

  const patientConflict = conflicts.find(
    (conflict) => conflict.patientUserId === input.patientId,
  );

  if (patientConflict) {
    throw AppError.conflict(
      "APPOINTMENT_PATIENT_CONFLICT",
      "Patient already has a scheduled appointment in the requested time range.",
    );
  }
};

const ensureSchedulingRules = async (
  repository: AppointmentsRepositoryContract,
  input: {
    organizationId: string;
    organizationTimeZone: string;
    doctorId: string;
    patientId: string;
    timing: AppointmentTiming;
    excludeAppointmentId?: string;
  },
): Promise<void> => {
  await repository.lockDoctorSchedule(input.organizationId, input.doctorId);
  await repository.lockPatientSchedule(input.organizationId, input.patientId);
  await ensureWithinWorkingHours(
    repository,
    input.organizationId,
    input.organizationTimeZone,
    input.doctorId,
    input.timing,
  );
  await ensureNoTimeOffOverlap(
    repository,
    input.organizationId,
    input.doctorId,
    input.timing,
  );
  await ensureNoAppointmentConflict(repository, input);
};

const hasScheduleChange = (
  payload: UpdateAppointmentScheduleRequestDto,
): boolean => {
  return (
    payload.doctorId !== undefined ||
    payload.appointmentTypeId !== undefined ||
    payload.startAt !== undefined ||
    payload.endAt !== undefined
  );
};

const groupConflictsByDoctor = (
  conflicts: readonly AppointmentConflictRecord[],
): Map<string, AppointmentConflictRecord[]> => {
  const groupedConflicts = new Map<string, AppointmentConflictRecord[]>();

  for (const conflict of conflicts) {
    const doctorConflicts = groupedConflicts.get(conflict.doctorUserId) ?? [];

    doctorConflicts.push(conflict);
    groupedConflicts.set(conflict.doctorUserId, doctorConflicts);
  }

  return groupedConflicts;
};

const groupTimeOffByDoctor = (
  timeOff: readonly AppointmentTimeOffRecord[],
): Map<string, AppointmentTimeOffRecord[]> => {
  const groupedTimeOff = new Map<string, AppointmentTimeOffRecord[]>();

  for (const entry of timeOff) {
    const doctorTimeOff = groupedTimeOff.get(entry.doctorUserId) ?? [];

    doctorTimeOff.push(entry);
    groupedTimeOff.set(entry.doctorUserId, doctorTimeOff);
  }

  return groupedTimeOff;
};

const isSlotAvailable = (
  startAt: Date,
  endAt: Date,
  conflicts: readonly AppointmentConflictRecord[],
  timeOff: readonly AppointmentTimeOffRecord[],
): boolean => {
  return (
    conflicts.every(
      (conflict) => !overlaps(startAt, endAt, conflict.startAt, conflict.endAt),
    ) &&
    timeOff.every(
      (entry) => !overlaps(startAt, endAt, entry.startAt, entry.endAt),
    )
  );
};

const resolveAvailabilityContext = async (
  repository: AppointmentsRepositoryContract,
  organizationId: string,
  query: AvailableAppointmentSlotsQueryDto,
): Promise<AvailabilityContext> => {
  const [organization, appointmentType, doctors] = await Promise.all([
    repository.findOrganization(organizationId),
    repository.findAppointmentType(organizationId, query.appointmentTypeId),
    repository.findActiveDoctors(organizationId, query.doctorId),
  ]);

  if (!organization) {
    throw AppError.notFound("Organization not found.");
  }

  if (!appointmentType || !appointmentType.isActive) {
    throw AppError.notFound("Active appointment type not found.");
  }

  if (query.doctorId && doctors.length === 0) {
    throw AppError.notFound("Active doctor not found in organization.");
  }

  return {
    organization,
    appointmentType,
    doctors,
  };
};

export class AppointmentsService {
  public constructor(
    private readonly appointmentsRepository: AppointmentsRepositoryContract = new AppointmentsRepository(
      db,
    ),
    private readonly runInTransaction: AppointmentsTransactionRunner = defaultRunInTransaction,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async list(
    context: AppointmentsRequestContext,
    query: AppointmentListQueryDto = {},
  ): Promise<AppointmentListResponseDto> {
    ensureSchedulingRole(context.role);

    const filters = buildListFilters(context, query);
    const isPaginated = query.page !== undefined;
    const page = query.page ?? 1;

    if (isPaginated) {
      const { limit, offset, ...countFilters } = filters;
      const [appointments, totalItems] = await Promise.all([
        this.appointmentsRepository.findMany(filters),
        this.appointmentsRepository.countMany(countFilters),
      ]);

      return {
        appointments: appointments.map(mapAppointmentResponse),
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(totalItems / PAGE_SIZE),
        totalItems,
      };
    }

    const appointments = await this.appointmentsRepository.findMany(filters);

    return {
      appointments: appointments.map(mapAppointmentResponse),
      page: 1,
      pageSize: filters.limit,
      totalPages: 1,
      totalItems: appointments.length,
    };
  }

  public async getById(
    context: AppointmentsRequestContext,
    appointmentId: string,
  ): Promise<AppointmentResponseDto> {
    ensureSchedulingRole(context.role);

    const appointment = await this.appointmentsRepository.findById(
      context.organizationId,
      appointmentId,
    );

    if (!appointment) {
      throw AppError.notFound("Appointment not found.");
    }

    ensureAppointmentIsVisible(context, appointment);

    return mapAppointmentResponse(appointment);
  }

  public async findAvailableSlots(
    context: AppointmentsRequestContext,
    query: AvailableAppointmentSlotsQueryDto,
  ): Promise<AppointmentAvailableSlotListResponseDto> {
    ensureSchedulingRole(context.role);

    if (
      context.role === OrganizationUserRole.DOCTOR &&
      query.doctorId &&
      query.doctorId !== context.userId
    ) {
      throw AppError.forbidden();
    }

    const normalizedQuery =
      context.role === OrganizationUserRole.DOCTOR && !query.doctorId
        ? { ...query, doctorId: context.userId }
        : query;
    const availabilityContext = await resolveAvailabilityContext(
      this.appointmentsRepository,
      context.organizationId,
      normalizedQuery,
    );
    const slots = await this.buildAvailableSlots(
      context.organizationId,
      normalizedQuery,
      availabilityContext,
    );

    return { slots };
  }

  public async create(
    context: AppointmentsRequestContext,
    payload: CreateAppointmentRequestDto,
  ): Promise<AppointmentResponseDto> {
    ensureCreateAccess(context, payload);

    return this.runInTransaction(async (repository) => {
      const { organization, appointmentType } = await resolveSchedulingContext(
        repository,
        context.organizationId,
        payload.doctorId,
        payload.appointmentTypeId,
      );
      const timing = createTiming(
        payload.startAt,
        payload.endAt,
        appointmentType.defaultDurationMinutes,
      );

      ensureNotPast(timing, this.now());
      await ensurePatientExists(
        repository,
        context.organizationId,
        payload.patientId,
      );
      await ensureSchedulingRules(repository, {
        organizationId: context.organizationId,
        organizationTimeZone: organization.timezone,
        doctorId: payload.doctorId,
        patientId: payload.patientId,
        timing,
      });

      const createInput: CreateAppointmentInput = {
        organizationId: context.organizationId,
        doctorUserId: payload.doctorId,
        patientUserId: payload.patientId,
        appointmentTypeId: payload.appointmentTypeId,
        startAt: timing.startAt,
        endAt: timing.endAt,
        createdByOrgUserId: context.organizationUserId,
        notes: normalizeNotes(payload.notes),
      };
      const appointment = await repository.createAppointment(createInput);

      return mapAppointmentResponse(appointment);
    });
  }

  public async reschedule(
    context: AppointmentsRequestContext,
    appointmentId: string,
    payload: UpdateAppointmentScheduleRequestDto,
  ): Promise<AppointmentResponseDto> {
    ensureSchedulingRole(context.role);

    return this.runInTransaction(async (repository) => {
      const appointment = await repository.findById(
        context.organizationId,
        appointmentId,
      );

      if (!appointment) {
        throw AppError.notFound("Appointment not found.");
      }

      ensureUpdateAccess(context, appointment);

      if (hasScheduleChange(payload) && appointment.status !== "SCHEDULED") {
        throw AppError.conflict(
          "APPOINTMENT_NOT_RESCHEDULABLE",
          "Only scheduled appointments can be rescheduled.",
        );
      }

      const nextDoctorId = payload.doctorId ?? appointment.doctor.id;
      const nextAppointmentTypeId =
        payload.appointmentTypeId ?? appointment.appointmentType.id;
      const { organization, appointmentType } = await resolveSchedulingContext(
        repository,
        context.organizationId,
        nextDoctorId,
        nextAppointmentTypeId,
      );
      const nextStartAt = payload.startAt
        ? parseDateTime(payload.startAt, "APPOINTMENT_INVALID_START_AT")
        : appointment.startAt;
      const nextEndAt = payload.endAt
        ? parseDateTime(payload.endAt, "APPOINTMENT_INVALID_END_AT")
        : payload.startAt || payload.appointmentTypeId
          ? addMinutes(nextStartAt, appointmentType.defaultDurationMinutes)
          : appointment.endAt;
      const timing = { startAt: nextStartAt, endAt: nextEndAt };

      validateTiming(timing);

      if (hasScheduleChange(payload)) {
        ensureNotPast(timing, this.now());
        await ensureSchedulingRules(repository, {
          organizationId: context.organizationId,
          organizationTimeZone: organization.timezone,
          doctorId: nextDoctorId,
          patientId: appointment.patient.id,
          timing,
          excludeAppointmentId: appointment.id,
        });
      }

      const updateInput: UpdateAppointmentScheduleInput = {
        updatedByOrgUserId: context.organizationUserId,
      };

      if (payload.doctorId !== undefined) {
        updateInput.doctorUserId = nextDoctorId;
      }

      if (payload.appointmentTypeId !== undefined) {
        updateInput.appointmentTypeId = nextAppointmentTypeId;
      }

      if (
        payload.startAt !== undefined ||
        payload.appointmentTypeId !== undefined
      ) {
        updateInput.startAt = timing.startAt;
      }

      if (
        payload.endAt !== undefined ||
        payload.startAt !== undefined ||
        payload.appointmentTypeId !== undefined
      ) {
        updateInput.endAt = timing.endAt;
      }

      if (payload.notes !== undefined) {
        updateInput.notes = normalizeNotes(payload.notes);
      }

      const updatedAppointment = await repository.updateSchedule(
        context.organizationId,
        appointmentId,
        updateInput,
      );

      if (!updatedAppointment) {
        throw AppError.notFound("Appointment not found.");
      }

      return mapAppointmentResponse(updatedAppointment);
    });
  }

  public async cancel(
    context: AppointmentsRequestContext,
    appointmentId: string,
    payload: CancelAppointmentRequestDto,
  ): Promise<AppointmentResponseDto> {
    ensureSchedulingRole(context.role);

    return this.runInTransaction(async (repository) => {
      const appointment = await repository.findById(
        context.organizationId,
        appointmentId,
      );

      if (!appointment) {
        throw AppError.notFound("Appointment not found.");
      }

      ensureUpdateAccess(context, appointment);

      if (appointment.status !== "SCHEDULED") {
        throw AppError.conflict(
          "APPOINTMENT_NOT_CANCELLABLE",
          "Only scheduled appointments can be cancelled.",
        );
      }

      const cancelledAppointment = await repository.cancelAppointment(
        context.organizationId,
        appointmentId,
        {
          updatedByOrgUserId: context.organizationUserId,
          cancellationReason: payload.cancellationReason.trim(),
        },
      );

      if (!cancelledAppointment) {
        throw AppError.notFound("Appointment not found.");
      }

      return mapAppointmentResponse(cancelledAppointment);
    });
  }

  private async buildAvailableSlots(
    organizationId: string,
    query: AvailableAppointmentSlotsQueryDto,
    context: AvailabilityContext,
  ): Promise<AppointmentAvailableSlotDto[]> {
    if (context.doctors.length === 0) {
      return [];
    }

    const timeZone = context.organization.timezone || DEFAULT_TIMEZONE;
    const dateParts = parseDateOnlyParts(query.date);
    const dayWindow = createDayWindowFromParts(dateParts, timeZone);
    const dayOfWeek = getDayOfWeek(dateParts);
    const doctorIds = context.doctors.map((doctor) => doctor.id);
    const [workingHours, appointments, timeOff] = await Promise.all([
      this.appointmentsRepository.findWorkingHoursForDoctors(
        organizationId,
        doctorIds,
        dayOfWeek,
      ),
      this.appointmentsRepository.findAppointmentsForDoctors(
        organizationId,
        doctorIds,
        dayWindow.start,
        dayWindow.end,
      ),
      this.appointmentsRepository.findTimeOffForDoctors(
        organizationId,
        doctorIds,
        dayWindow.start,
        dayWindow.end,
      ),
    ]);
    const doctorsById = new Map(
      context.doctors.map((doctor): [string, AppointmentDoctorRecord] => [
        doctor.id,
        doctor,
      ]),
    );
    const conflictsByDoctor = groupConflictsByDoctor(appointments);
    const timeOffByDoctor = groupTimeOffByDoctor(timeOff);
    const slots: AppointmentAvailableSlotDto[] = [];

    for (const workingHour of workingHours) {
      this.appendAvailableSlotsForWorkingHour({
        workingHour,
        doctorsById,
        conflictsByDoctor,
        timeOffByDoctor,
        dateParts,
        timeZone,
        durationMinutes: context.appointmentType.defaultDurationMinutes,
        now: this.now(),
        limit: query.limit ?? DEFAULT_SLOT_LIMIT,
        slots,
      });
    }

    return slots
      .sort((firstSlot, secondSlot) =>
        firstSlot.startAt.localeCompare(secondSlot.startAt),
      )
      .slice(0, query.limit ?? DEFAULT_SLOT_LIMIT);
  }

  private appendAvailableSlotsForWorkingHour(input: {
    workingHour: AppointmentWorkingHourRecord;
    doctorsById: ReadonlyMap<string, AppointmentDoctorRecord>;
    conflictsByDoctor: ReadonlyMap<string, AppointmentConflictRecord[]>;
    timeOffByDoctor: ReadonlyMap<string, AppointmentTimeOffRecord[]>;
    dateParts: ZonedDateParts;
    timeZone: string;
    durationMinutes: number;
    now: Date;
    limit: number;
    slots: AppointmentAvailableSlotDto[];
  }): void {
    if (input.workingHour.isOff || input.slots.length >= input.limit) {
      return;
    }

    const doctor = input.doctorsById.get(input.workingHour.doctorUserId);

    if (!doctor) {
      return;
    }

    const workStart = combineLocalDateAndTime(
      input.dateParts,
      input.timeZone,
      input.workingHour.startTime,
    );
    const workEnd = combineLocalDateAndTime(
      input.dateParts,
      input.timeZone,
      input.workingHour.endTime,
    );
    const doctorConflicts =
      input.conflictsByDoctor.get(input.workingHour.doctorUserId) ?? [];
    const doctorTimeOff =
      input.timeOffByDoctor.get(input.workingHour.doctorUserId) ?? [];

    for (
      let slotStart = workStart;
      addMinutes(slotStart, input.durationMinutes) <= workEnd &&
      input.slots.length < input.limit;
      slotStart = addMinutes(slotStart, input.durationMinutes)
    ) {
      const slotEnd = addMinutes(slotStart, input.durationMinutes);

      if (slotStart < input.now) {
        continue;
      }

      if (
        !isSlotAvailable(slotStart, slotEnd, doctorConflicts, doctorTimeOff)
      ) {
        continue;
      }

      input.slots.push({
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        doctorTitle: doctor.title,
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        durationMinutes: input.durationMinutes,
      });
    }
  }
}

export const appointmentsService = new AppointmentsService();
