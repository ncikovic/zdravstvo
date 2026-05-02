import {
  type AdminReceptionDashboardDto,
  type DashboardActivityDto,
  type DashboardAppointmentDto,
  type DashboardAppointmentStatusDto,
  type DashboardDoctorDto,
  type DashboardFreeSlotDto,
  type DashboardOrganizationDto,
  type DashboardPatientDto,
  type DashboardReminderDto,
  type DashboardReminderSummaryDto,
  type DashboardResponseDto,
  type DoctorDashboardDto,
  OrganizationUserRole,
  type PatientDashboardDto,
} from "@zdravstvo/contracts";

import { AppError } from "../errors/AppError.js";
import {
  DashboardRepository,
  type DashboardActivityRecord,
  type DashboardAppointmentRecord,
  type DashboardDoctorRecord,
  type DashboardOrganizationRecord,
  type DashboardReminderRecord,
  type DashboardReminderSummaryRecord,
  type DashboardTimeOffRecord,
  type DashboardWorkingHourRecord,
} from "../repositories/index.js";
import type { AuthenticatedRequestContext } from "../shared/context/index.js";
import { db } from "../shared/db/index.js";

type DashboardRequestContext = Pick<
  AuthenticatedRequestContext,
  "organizationId" | "role" | "userId"
>;

type DashboardRepositoryContract = Pick<
  DashboardRepository,
  | "findOrganization"
  | "findActiveDoctors"
  | "countRecentPatients"
  | "countAppointments"
  | "countDistinctPatients"
  | "countAppointmentsByStatus"
  | "findAppointments"
  | "countReminders"
  | "findReminders"
  | "findRecentActivities"
  | "findWorkingHoursForDoctors"
  | "findTimeOffForDoctors"
>;

type DashboardBaseResponse = Pick<
  AdminReceptionDashboardDto,
  "generatedAt" | "todayStart" | "todayEnd" | "organization"
>;

interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
}

interface DayWindow {
  start: Date;
  end: Date;
}

interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_TIMEZONE = "Europe/Zagreb";
const TODAY_SCHEDULE_LIMIT = 8;
const PATIENT_UPCOMING_LIMIT = 4;
const REMINDER_LIMIT = 3;
const ACTIVITY_LIMIT = 5;
const FREE_SLOT_LIMIT = 3;
const FREE_SLOT_DURATION_MINUTES = 30;
const RECENT_PATIENT_DAYS = 30;
const UPCOMING_APPOINTMENT_DAYS = 90;
const PATIENT_CONFIRMED_DAYS = 30;
const SCHEDULED_STATUS: readonly DashboardAppointmentStatusDto[] = [
  "SCHEDULED",
];

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

const createDayWindow = (date: Date, timeZone: string): DayWindow => {
  const dateParts = getZonedDateParts(date, timeZone);
  const nextDateParts = addLocalDays(dateParts, 1);

  return {
    start: zonedTimeToUtc(dateParts, timeZone),
    end: zonedTimeToUtc(nextDateParts, timeZone),
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

const getDayOfWeek = (dateParts: ZonedDateParts): number => {
  return new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day),
  ).getUTCDay();
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

const combineLocalDateAndTime = (
  dateParts: ZonedDateParts,
  timeZone: string,
  time: string,
): Date => {
  return zonedTimeToUtc(dateParts, timeZone, parseTimeParts(time));
};

const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

const overlaps = (
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean => {
  return firstStart < secondEnd && firstEnd > secondStart;
};

const toDateOnlyIso = (date: Date | null): string | null => {
  return date ? date.toISOString().slice(0, 10) : null;
};

const mapDoctorResponse = (
  doctor: DashboardDoctorRecord,
): DashboardDoctorDto => {
  return {
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    title: doctor.title,
  };
};

const mapPatientResponse = (
  patient: DashboardAppointmentRecord["patient"],
): DashboardPatientDto => {
  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: toDateOnlyIso(patient.dateOfBirth),
    oib: patient.oib,
  };
};

const mapAppointmentResponse = (
  appointment: DashboardAppointmentRecord,
): DashboardAppointmentDto => {
  return {
    id: appointment.id,
    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),
    status: appointment.status,
    notes: appointment.notes,
    cancellationReason: appointment.cancellationReason,
    doctor: mapDoctorResponse(appointment.doctor),
    patient: mapPatientResponse(appointment.patient),
    appointmentType: {
      id: appointment.appointmentType.id,
      name: appointment.appointmentType.name,
      defaultDurationMinutes:
        appointment.appointmentType.defaultDurationMinutes,
    },
  };
};

const mapReminderSummaryResponse = (
  summary: DashboardReminderSummaryRecord,
): DashboardReminderSummaryDto => {
  return {
    total: summary.total,
    pending: summary.pending,
    sent: summary.sent,
    failed: summary.failed,
  };
};

const mapReminderResponse = (
  reminder: DashboardReminderRecord,
): DashboardReminderDto => {
  return {
    id: reminder.id,
    appointmentId: reminder.appointmentId,
    channel: reminder.channel,
    scheduledFor: reminder.scheduledFor.toISOString(),
    sentAt: reminder.sentAt?.toISOString() ?? null,
    status: reminder.status,
    appointment: mapAppointmentResponse(reminder.appointment),
  };
};

const mapActivityResponse = (
  activity: DashboardActivityRecord,
): DashboardActivityDto => {
  return {
    id: activity.id,
    entityType: activity.entityType,
    action: activity.action,
    createdAt: activity.createdAt.toISOString(),
  };
};

const mapOrganizationResponse = (
  organization: DashboardOrganizationRecord,
): DashboardOrganizationDto => {
  return {
    id: organization.id,
    name: organization.name,
    address: organization.address,
    city: organization.city,
  };
};

const sumAppointmentCounts = (
  counts: Record<DashboardAppointmentStatusDto, number>,
): number => {
  return counts.SCHEDULED + counts.CANCELLED + counts.COMPLETED + counts.NO_SHOW;
};

const groupAppointmentsByDoctor = (
  appointments: readonly DashboardAppointmentRecord[],
): Map<string, DashboardAppointmentRecord[]> => {
  const groupedAppointments = new Map<string, DashboardAppointmentRecord[]>();

  for (const appointment of appointments) {
    const doctorAppointments =
      groupedAppointments.get(appointment.doctor.id) ?? [];

    doctorAppointments.push(appointment);
    groupedAppointments.set(appointment.doctor.id, doctorAppointments);
  }

  return groupedAppointments;
};

const groupTimeOffByDoctor = (
  timeOff: readonly DashboardTimeOffRecord[],
): Map<string, DashboardTimeOffRecord[]> => {
  const groupedTimeOff = new Map<string, DashboardTimeOffRecord[]>();

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
  appointments: readonly DashboardAppointmentRecord[],
  timeOff: readonly DashboardTimeOffRecord[],
): boolean => {
  return (
    appointments.every(
      (appointment) =>
        !overlaps(startAt, endAt, appointment.startAt, appointment.endAt),
    ) &&
    timeOff.every((entry) => !overlaps(startAt, endAt, entry.startAt, entry.endAt))
  );
};

export class DashboardService {
  public constructor(
    private readonly dashboardRepository: DashboardRepositoryContract = new DashboardRepository(
      db,
    ),
  ) {}

  public async getCurrent(
    context: DashboardRequestContext,
  ): Promise<DashboardResponseDto> {
    const now = new Date();
    const organization = await this.dashboardRepository.findOrganization(
      context.organizationId,
    );
    const timeZone = organization?.timezone ?? DEFAULT_TIMEZONE;
    const today = createDayWindow(now, timeZone);
    const base = {
      generatedAt: now.toISOString(),
      todayStart: today.start.toISOString(),
      todayEnd: today.end.toISOString(),
      organization: organization
        ? mapOrganizationResponse(organization)
        : {
            id: context.organizationId,
            name: "",
            address: null,
            city: null,
          },
    };

    if (
      context.role === OrganizationUserRole.ADMIN ||
      context.role === OrganizationUserRole.RECEPTION
    ) {
      return this.getAdminReceptionDashboard(context, timeZone, now, today, base);
    }

    if (context.role === OrganizationUserRole.DOCTOR) {
      return this.getDoctorDashboard(context, timeZone, now, today, base);
    }

    if (context.role === OrganizationUserRole.PATIENT) {
      return this.getPatientDashboard(context, now, today, base);
    }

    throw AppError.forbidden();
  }

  private async getAdminReceptionDashboard(
    context: DashboardRequestContext,
    timeZone: string,
    now: Date,
    today: DayWindow,
    base: DashboardBaseResponse,
  ): Promise<AdminReceptionDashboardDto> {
    const recentPatientSince = addDays(now, -RECENT_PATIENT_DAYS);
    const [
      activeDoctors,
      recentPatientCount,
      appointmentCounts,
      todaySchedule,
      reminderSummary,
      recentActivity,
    ] = await Promise.all([
      this.dashboardRepository.findActiveDoctors(context.organizationId),
      this.dashboardRepository.countRecentPatients(
        context.organizationId,
        recentPatientSince,
      ),
      this.dashboardRepository.countAppointmentsByStatus({
        organizationId: context.organizationId,
        startAt: today.start,
        endAt: today.end,
      }),
      this.dashboardRepository.findAppointments({
        organizationId: context.organizationId,
        startAt: today.start,
        endAt: today.end,
        limit: TODAY_SCHEDULE_LIMIT,
      }),
      this.dashboardRepository.countReminders({
        organizationId: context.organizationId,
        startAt: today.start,
        endAt: today.end,
      }),
      this.dashboardRepository.findRecentActivities({
        organizationId: context.organizationId,
        limit: ACTIVITY_LIMIT,
      }),
    ]);
    const availableSlots = await this.findAvailableSlots({
      organizationId: context.organizationId,
      doctors: activeDoctors,
      timeZone,
      now,
      limit: FREE_SLOT_LIMIT,
    });

    return {
      ...base,
      role: context.role as
        | OrganizationUserRole.ADMIN
        | OrganizationUserRole.RECEPTION,
      stats: {
        todayAppointmentCount: sumAppointmentCounts(appointmentCounts),
        activeDoctorCount: activeDoctors.length,
        recentPatientCount,
        reminderCount: reminderSummary.total,
        completedAppointmentCount: appointmentCounts.COMPLETED,
        scheduledAppointmentCount: appointmentCounts.SCHEDULED,
        cancelledAppointmentCount: appointmentCounts.CANCELLED,
        sentReminderCount: reminderSummary.sent,
      },
      reminderSummary: mapReminderSummaryResponse(reminderSummary),
      todaySchedule: todaySchedule.map(mapAppointmentResponse),
      availableSlots,
      recentActivity: recentActivity.map(mapActivityResponse),
    };
  }

  private async getDoctorDashboard(
    context: DashboardRequestContext,
    timeZone: string,
    now: Date,
    today: DayWindow,
    base: DashboardBaseResponse,
  ): Promise<DoctorDashboardDto> {
    const upcomingEnd = addDays(now, UPCOMING_APPOINTMENT_DAYS);
    const [
      activeDoctors,
      appointmentCounts,
      todaySchedule,
      patientsTodayCount,
      upcomingAppointments,
      recentActivity,
    ] = await Promise.all([
      this.dashboardRepository.findActiveDoctors(context.organizationId),
      this.dashboardRepository.countAppointmentsByStatus({
        organizationId: context.organizationId,
        startAt: today.start,
        endAt: today.end,
        doctorUserId: context.userId,
      }),
      this.dashboardRepository.findAppointments({
        organizationId: context.organizationId,
        startAt: today.start,
        endAt: today.end,
        doctorUserId: context.userId,
        limit: TODAY_SCHEDULE_LIMIT,
      }),
      this.dashboardRepository.countDistinctPatients({
        organizationId: context.organizationId,
        startAt: today.start,
        endAt: today.end,
        doctorUserId: context.userId,
      }),
      this.dashboardRepository.findAppointments({
        organizationId: context.organizationId,
        startAt: now,
        endAt: upcomingEnd,
        doctorUserId: context.userId,
        statuses: SCHEDULED_STATUS,
        limit: 1,
      }),
      this.dashboardRepository.findRecentActivities({
        organizationId: context.organizationId,
        doctorUserId: context.userId,
        limit: ACTIVITY_LIMIT,
      }),
    ]);
    const currentDoctor = activeDoctors.filter(
      (doctor) => doctor.id === context.userId,
    );
    const availableSlots = await this.findAvailableSlots({
      organizationId: context.organizationId,
      doctors: currentDoctor,
      timeZone,
      now,
      limit: FREE_SLOT_LIMIT,
    });

    return {
      ...base,
      role: OrganizationUserRole.DOCTOR,
      stats: {
        todayAppointmentCount: sumAppointmentCounts(appointmentCounts),
        patientsTodayCount,
        freeBlockCount: availableSlots.length,
        completedAppointmentCount: appointmentCounts.COMPLETED,
      },
      todaySchedule: todaySchedule.map(mapAppointmentResponse),
      nextAppointment: upcomingAppointments[0]
        ? mapAppointmentResponse(upcomingAppointments[0])
        : null,
      availableSlots,
      recentActivity: recentActivity.map(mapActivityResponse),
    };
  }

  private async getPatientDashboard(
    context: DashboardRequestContext,
    now: Date,
    today: DayWindow,
    base: DashboardBaseResponse,
  ): Promise<PatientDashboardDto> {
    const upcomingEnd = addDays(now, UPCOMING_APPOINTMENT_DAYS);
    const confirmedEnd = addDays(now, PATIENT_CONFIRMED_DAYS);
    const [upcomingAppointments, confirmedFutureAppointmentCount, reminders] =
      await Promise.all([
        this.dashboardRepository.findAppointments({
          organizationId: context.organizationId,
          startAt: now,
          endAt: upcomingEnd,
          patientUserId: context.userId,
          statuses: SCHEDULED_STATUS,
          limit: PATIENT_UPCOMING_LIMIT,
        }),
        this.dashboardRepository.countAppointments({
          organizationId: context.organizationId,
          startAt: now,
          endAt: confirmedEnd,
          patientUserId: context.userId,
          statuses: SCHEDULED_STATUS,
        }),
        this.dashboardRepository.findReminders({
          organizationId: context.organizationId,
          startAt: today.start,
          endAt: upcomingEnd,
          patientUserId: context.userId,
          limit: REMINDER_LIMIT,
        }),
      ]);
    const reminderSummary = reminders.reduce<DashboardReminderSummaryRecord>(
      (summary, reminder) => {
        summary.total += 1;

        if (reminder.status === "PENDING") {
          summary.pending += 1;
        } else if (reminder.status === "SENT") {
          summary.sent += 1;
        } else {
          summary.failed += 1;
        }

        return summary;
      },
      { total: 0, pending: 0, sent: 0, failed: 0 },
    );

    return {
      ...base,
      role: OrganizationUserRole.PATIENT,
      stats: {
        confirmedFutureAppointmentCount,
        reminderCount: reminderSummary.total,
      },
      nextAppointment: upcomingAppointments[0]
        ? mapAppointmentResponse(upcomingAppointments[0])
        : null,
      upcomingAppointments: upcomingAppointments.map(mapAppointmentResponse),
      reminders: reminders.map(mapReminderResponse),
      reminderSummary: mapReminderSummaryResponse(reminderSummary),
    };
  }

  private async findAvailableSlots(input: {
    organizationId: string;
    doctors: readonly DashboardDoctorRecord[];
    timeZone: string;
    now: Date;
    limit: number;
  }): Promise<DashboardFreeSlotDto[]> {
    if (input.doctors.length === 0) {
      return [];
    }

    const doctorIds = input.doctors.map((doctor) => doctor.id);
    const doctorsById = new Map(input.doctors.map((doctor) => [doctor.id, doctor]));
    const todayParts = getZonedDateParts(input.now, input.timeZone);
    const slots: DashboardFreeSlotDto[] = [];

    for (let dayOffset = 0; dayOffset < 7 && slots.length < input.limit; dayOffset += 1) {
      const dateParts = addLocalDays(todayParts, dayOffset);
      const dayWindow = createDayWindowFromParts(dateParts, input.timeZone);
      const dayOfWeek = getDayOfWeek(dateParts);
      const [workingHours, appointments, timeOff] = await Promise.all([
        this.dashboardRepository.findWorkingHoursForDoctors(
          input.organizationId,
          doctorIds,
          dayOfWeek,
        ),
        this.dashboardRepository.findAppointments({
          organizationId: input.organizationId,
          startAt: dayWindow.start,
          endAt: dayWindow.end,
          doctorUserIds: doctorIds,
          statuses: SCHEDULED_STATUS,
        }),
        this.dashboardRepository.findTimeOffForDoctors(
          input.organizationId,
          doctorIds,
          dayWindow.start,
          dayWindow.end,
        ),
      ]);
      const appointmentsByDoctor = groupAppointmentsByDoctor(appointments);
      const timeOffByDoctor = groupTimeOffByDoctor(timeOff);

      this.appendAvailableSlotsForDay({
        dateParts,
        timeZone: input.timeZone,
        now: input.now,
        limit: input.limit,
        doctorsById,
        workingHours,
        appointmentsByDoctor,
        timeOffByDoctor,
        slots,
      });
    }

    return slots
      .sort((firstSlot, secondSlot) =>
        firstSlot.startAt.localeCompare(secondSlot.startAt),
      )
      .slice(0, input.limit);
  }

  private appendAvailableSlotsForDay(input: {
    dateParts: ZonedDateParts;
    timeZone: string;
    now: Date;
    limit: number;
    doctorsById: ReadonlyMap<string, DashboardDoctorRecord>;
    workingHours: readonly DashboardWorkingHourRecord[];
    appointmentsByDoctor: ReadonlyMap<string, DashboardAppointmentRecord[]>;
    timeOffByDoctor: ReadonlyMap<string, DashboardTimeOffRecord[]>;
    slots: DashboardFreeSlotDto[];
  }): void {
    for (const workingHour of input.workingHours) {
      if (workingHour.isOff || input.slots.length >= input.limit) {
        continue;
      }

      const doctor = input.doctorsById.get(workingHour.doctorUserId);

      if (!doctor) {
        continue;
      }

      const workStart = combineLocalDateAndTime(
        input.dateParts,
        input.timeZone,
        workingHour.startTime,
      );
      const workEnd = combineLocalDateAndTime(
        input.dateParts,
        input.timeZone,
        workingHour.endTime,
      );
      const doctorAppointments =
        input.appointmentsByDoctor.get(workingHour.doctorUserId) ?? [];
      const doctorTimeOff =
        input.timeOffByDoctor.get(workingHour.doctorUserId) ?? [];

      for (
        let slotStart = workStart;
        addMinutes(slotStart, FREE_SLOT_DURATION_MINUTES) <= workEnd &&
        input.slots.length < input.limit;
        slotStart = addMinutes(slotStart, FREE_SLOT_DURATION_MINUTES)
      ) {
        const slotEnd = addMinutes(slotStart, FREE_SLOT_DURATION_MINUTES);

        if (slotStart < input.now) {
          continue;
        }

        if (
          !isSlotAvailable(
            slotStart,
            slotEnd,
            doctorAppointments,
            doctorTimeOff,
          )
        ) {
          continue;
        }

        input.slots.push({
          doctorId: doctor.id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          doctorTitle: doctor.title,
          startAt: slotStart.toISOString(),
          endAt: slotEnd.toISOString(),
          durationMinutes: FREE_SLOT_DURATION_MINUTES,
        });
      }
    }
  }
}

export const dashboardService = new DashboardService();
