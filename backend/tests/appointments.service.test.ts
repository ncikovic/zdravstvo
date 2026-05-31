import assert from "node:assert/strict";
import test from "node:test";

import { OrganizationUserRole } from "@zdravstvo/contracts";

import type {
  CreateAppointmentInput,
  FindAppointmentsInput,
  FindConflictingAppointmentsInput,
  UpdateAppointmentScheduleInput,
  UpdateAppointmentStatusInput,
} from "../src/repositories/index.js";
import { AppointmentsService } from "../src/services/appointments.service.js";
import type { NotificationsService } from "../src/services/notifications.service.js";
import type {
  AppointmentConflictRecord,
  AppointmentDoctorRecord,
  AppointmentOrganizationRecord,
  AppointmentPatientRecord,
  AppointmentRecord,
  AppointmentTimeOffRecord,
  AppointmentTypeRecord,
  AppointmentWorkingHourRecord,
} from "../src/types/entities/index.js";

const ORGANIZATION_ID = "11111111-1111-4111-8111-111111111111";
const ORG_USER_ID = "22222222-2222-4222-8222-222222222222";
const PATIENT_ID = "33333333-3333-4333-8333-333333333333";
const DOCTOR_ID = "44444444-4444-4444-8444-444444444444";
const APPOINTMENT_TYPE_ID = "55555555-5555-4555-8555-555555555555";

const createPatientContext = () => ({
  organizationId: ORGANIZATION_ID,
  organizationUserId: ORG_USER_ID,
  role: OrganizationUserRole.PATIENT,
  userId: PATIENT_ID,
});

const createAppointment = (
  overrides: Partial<AppointmentRecord> = {},
): AppointmentRecord => ({
  id: `77777777-7777-4777-8777-${String(Math.floor(Math.random() * 1000000000000)).padStart(12, "0")}`,
  organizationId: ORGANIZATION_ID,
  startAt: new Date("2026-06-10T09:00:00.000Z"),
  endAt: new Date("2026-06-10T09:30:00.000Z"),
  status: "SCHEDULED",
  notes: null,
  cancellationReason: null,
  createdByOrgUserId: ORG_USER_ID,
  updatedByOrgUserId: null,
  createdAt: new Date("2026-06-01T08:00:00.000Z"),
  updatedAt: new Date("2026-06-01T08:00:00.000Z"),
  doctor: {
    id: DOCTOR_ID,
    firstName: "Ana",
    lastName: "Horvat",
    title: "dr. med.",
    isActive: true,
  },
  patient: {
    id: PATIENT_ID,
    firstName: "Marko",
    lastName: "Maric",
    dateOfBirth: null,
    oib: null,
  },
  appointmentType: {
    id: APPOINTMENT_TYPE_ID,
    name: "Kontrola",
    defaultDurationMinutes: 30,
    isActive: true,
  },
  ...overrides,
});

class InMemoryAppointmentsRepository {
  public appointments: AppointmentRecord[] = [];
  public timeOff: AppointmentTimeOffRecord[] = [];
  public appointmentType: AppointmentTypeRecord = {
    id: APPOINTMENT_TYPE_ID,
    name: "Kontrola",
    defaultDurationMinutes: 30,
    isActive: true,
  };

  private readonly organization: AppointmentOrganizationRecord = {
    id: ORGANIZATION_ID,
    timezone: "Europe/Zagreb",
  };

  private readonly doctor: AppointmentDoctorRecord = {
    id: DOCTOR_ID,
    firstName: "Ana",
    lastName: "Horvat",
    title: "dr. med.",
    isActive: true,
  };

  private readonly patient: AppointmentPatientRecord = {
    id: PATIENT_ID,
    firstName: "Marko",
    lastName: "Maric",
    dateOfBirth: null,
    oib: null,
  };

  public async findOrganization(): Promise<AppointmentOrganizationRecord> {
    return this.organization;
  }

  public async findDoctorInOrganization(): Promise<AppointmentDoctorRecord> {
    return this.doctor;
  }

  public async findActiveDoctors(): Promise<AppointmentDoctorRecord[]> {
    return [this.doctor];
  }

  public async findPatientInOrganization(): Promise<AppointmentPatientRecord> {
    return this.patient;
  }

  public async findAppointmentType(): Promise<AppointmentTypeRecord> {
    return this.appointmentType;
  }

  public async findWorkingHour(
    _organizationId: string,
    doctorUserId: string,
    dayOfWeek: number,
  ): Promise<AppointmentWorkingHourRecord> {
    return {
      id: "66666666-6666-4666-8666-666666666666",
      doctorUserId,
      dayOfWeek,
      startTime: "08:00:00",
      endTime: "16:00:00",
      isOff: false,
    };
  }

  public async findWorkingHoursForDoctors(
    _organizationId: string,
    doctorUserIds: readonly string[],
    dayOfWeek: number,
  ): Promise<AppointmentWorkingHourRecord[]> {
    return doctorUserIds.map((doctorUserId) => ({
      id: "66666666-6666-4666-8666-666666666666",
      doctorUserId,
      dayOfWeek,
      startTime: "08:00:00",
      endTime: "16:00:00",
      isOff: false,
    }));
  }

  public async findTimeOffOverlaps(
    _organizationId: string,
    doctorUserId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentTimeOffRecord[]> {
    return this.timeOff.filter(
      (entry) =>
        entry.doctorUserId === doctorUserId &&
        entry.startAt < endAt &&
        entry.endAt > startAt,
    );
  }

  public async findTimeOffForDoctors(
    _organizationId: string,
    doctorUserIds: readonly string[],
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentTimeOffRecord[]> {
    return this.timeOff.filter(
      (entry) =>
        doctorUserIds.includes(entry.doctorUserId) &&
        entry.startAt < endAt &&
        entry.endAt > startAt,
    );
  }

  public async findConflictingAppointments(
    input: FindConflictingAppointmentsInput,
  ): Promise<AppointmentConflictRecord[]> {
    return this.appointments
      .filter(
        (appointment) =>
          appointment.organizationId === input.organizationId &&
          appointment.id !== input.excludeAppointmentId &&
          appointment.status !== "CANCELLED" &&
          (appointment.doctor.id === input.doctorUserId ||
            appointment.patient.id === input.patientUserId) &&
          appointment.startAt < input.endAt &&
          appointment.endAt > input.startAt,
      )
      .map((appointment) => ({
        id: appointment.id,
        doctorUserId: appointment.doctor.id,
        patientUserId: appointment.patient.id,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
      }));
  }

  public async findAppointmentsForDoctors(
    organizationId: string,
    doctorUserIds: readonly string[],
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentConflictRecord[]> {
    return this.appointments
      .filter(
        (appointment) =>
          appointment.organizationId === organizationId &&
          appointment.status !== "CANCELLED" &&
          doctorUserIds.includes(appointment.doctor.id) &&
          appointment.startAt < endAt &&
          appointment.endAt > startAt,
      )
      .map((appointment) => ({
        id: appointment.id,
        doctorUserId: appointment.doctor.id,
        patientUserId: appointment.patient.id,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
      }));
  }

  public async lockDoctorSchedule(): Promise<void> {}

  public async lockPatientSchedule(): Promise<void> {}

  public async findById(
    _organizationId: string,
    appointmentId: string,
  ): Promise<AppointmentRecord | null> {
    return (
      this.appointments.find((appointment) => appointment.id === appointmentId) ??
      null
    );
  }

  public async findMany(
    _input: FindAppointmentsInput,
  ): Promise<AppointmentRecord[]> {
    return this.appointments;
  }

  public async countMany(): Promise<number> {
    return this.appointments.length;
  }

  public async createAppointment(
    input: CreateAppointmentInput,
  ): Promise<AppointmentRecord> {
    const appointment = createAppointment({
      id: `77777777-7777-4777-8777-${String(this.appointments.length + 1).padStart(12, "0")}`,
      startAt: input.startAt,
      endAt: input.endAt,
      status: input.status,
      notes: input.notes,
      createdByOrgUserId: input.createdByOrgUserId,
      doctor: this.doctor,
      patient: this.patient,
      appointmentType: this.appointmentType,
    });

    this.appointments.push(appointment);

    return appointment;
  }

  public async updateSchedule(
    _organizationId: string,
    appointmentId: string,
    input: UpdateAppointmentScheduleInput,
  ): Promise<AppointmentRecord | null> {
    const appointment = await this.findById(ORGANIZATION_ID, appointmentId);

    if (!appointment) {
      return null;
    }

    if (input.startAt) {
      appointment.startAt = input.startAt;
    }

    if (input.endAt) {
      appointment.endAt = input.endAt;
    }

    return appointment;
  }

  public async updateStatus(
    _organizationId: string,
    appointmentId: string,
    input: UpdateAppointmentStatusInput,
  ): Promise<AppointmentRecord | null> {
    const appointment = await this.findById(ORGANIZATION_ID, appointmentId);

    if (!appointment) {
      return null;
    }

    appointment.status = input.status;

    return appointment;
  }

  public async cancelAppointment(): Promise<AppointmentRecord | null> {
    return null;
  }
}

class RecordingNotificationsService {
  public created: AppointmentRecord[] = [];

  public async notifyAppointmentCreated(input: {
    appointment: AppointmentRecord;
  }): Promise<void> {
    this.created.push(input.appointment);
  }
}

const createService = () => {
  const repository = new InMemoryAppointmentsRepository();
  const notifications = new RecordingNotificationsService();
  const service = new AppointmentsService(
    repository,
    async (handler) =>
      handler(
        repository,
        notifications as unknown as NotificationsService,
      ),
    () => new Date("2026-06-01T08:00:00.000Z"),
    notifications as unknown as NotificationsService,
  );

  return { repository, notifications, service };
};

test("patient booking creates a scheduled appointment and notification", async () => {
  const { notifications, service } = createService();

  const appointment = await service.create(createPatientContext(), {
    doctorId: DOCTOR_ID,
    patientId: PATIENT_ID,
    appointmentTypeId: APPOINTMENT_TYPE_ID,
    startAt: "2026-06-10T09:00:00.000Z",
  });

  assert.equal(appointment.status, "SCHEDULED");
  assert.equal(appointment.endAt, "2026-06-10T09:30:00.000Z");
  assert.equal(notifications.created.length, 1);
  assert.equal(notifications.created[0]?.status, "SCHEDULED");
});

test("booking an overlapping doctor interval fails", async () => {
  const { repository, service } = createService();
  repository.appointments.push(
    createAppointment({
      startAt: new Date("2026-06-10T09:00:00.000Z"),
      endAt: new Date("2026-06-10T09:30:00.000Z"),
    }),
  );

  await assert.rejects(
    () =>
      service.create(createPatientContext(), {
        doctorId: DOCTOR_ID,
        patientId: PATIENT_ID,
        appointmentTypeId: APPOINTMENT_TYPE_ID,
        startAt: "2026-06-10T09:15:00.000Z",
      }),
    /Doctor already has a scheduled appointment/,
  );
});

test("overlap check uses intervals when durations differ", async () => {
  const { repository, service } = createService();
  repository.appointmentType = {
    ...repository.appointmentType,
    defaultDurationMinutes: 45,
  };
  repository.appointments.push(
    createAppointment({
      startAt: new Date("2026-06-10T09:30:00.000Z"),
      endAt: new Date("2026-06-10T10:00:00.000Z"),
    }),
  );

  await assert.rejects(
    () =>
      service.create(createPatientContext(), {
        doctorId: DOCTOR_ID,
        patientId: PATIENT_ID,
        appointmentTypeId: APPOINTMENT_TYPE_ID,
        startAt: "2026-06-10T09:00:00.000Z",
      }),
    /Doctor already has a scheduled appointment/,
  );
});

test("cancelled appointments do not block new bookings", async () => {
  const { service, repository } = createService();
  repository.appointments.push(
    createAppointment({
      status: "CANCELLED",
      startAt: new Date("2026-06-10T09:00:00.000Z"),
      endAt: new Date("2026-06-10T09:30:00.000Z"),
    }),
  );

  const appointment = await service.create(createPatientContext(), {
    doctorId: DOCTOR_ID,
    patientId: PATIENT_ID,
    appointmentTypeId: APPOINTMENT_TYPE_ID,
    startAt: "2026-06-10T09:00:00.000Z",
  });

  assert.equal(appointment.status, "SCHEDULED");
});

test("available slots exclude intervals overlapping non-cancelled appointments", async () => {
  const { repository, service } = createService();
  repository.appointments.push(
    createAppointment({
      startAt: new Date("2026-06-10T09:15:00.000Z"),
      endAt: new Date("2026-06-10T10:00:00.000Z"),
    }),
  );

  const result = await service.findAvailableSlots(createPatientContext(), {
    appointmentTypeId: APPOINTMENT_TYPE_ID,
    date: "2026-06-10",
    doctorId: DOCTOR_ID,
    limit: 6,
  });

  assert.equal(
    result.slots.some((slot) => slot.startAt === "2026-06-10T09:00:00.000Z"),
    false,
  );
  assert.equal(
    result.slots.some((slot) => slot.startAt === "2026-06-10T09:30:00.000Z"),
    false,
  );
});
