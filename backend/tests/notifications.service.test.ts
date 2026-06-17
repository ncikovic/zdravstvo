import assert from "node:assert/strict";
import test from "node:test";

import {
  OrganizationUserRole,
  type NotificationDto,
  type NotificationListQueryDto,
  type NotificationSummaryDto,
} from "@zdravstvo/contracts";

import type {
  CreateNotificationInput,
  NotificationRecipientRecord,
  NotificationsRepository,
} from "../src/repositories/index.js";
import { NotificationsService } from "../src/services/notifications.service.js";
import type { AppointmentRecord } from "../src/types/entities/index.js";

const ORGANIZATION_ID = "11111111-1111-4111-8111-111111111111";
const ACTOR_ID = "22222222-2222-4222-8222-222222222222";
const PATIENT_ID = "33333333-3333-4333-8333-333333333333";
const DOCTOR_ID = "44444444-4444-4444-8444-444444444444";
const MANAGER_ID = "55555555-5555-4555-8555-555555555555";
const RECEPTION_ID = "66666666-6666-4666-8666-666666666666";
const APPOINTMENT_ID = "77777777-7777-4777-8777-777777777777";

class InMemoryNotificationsRepository {
  public notifications: CreateNotificationInput[] = [];
  public readIds = new Set<string>();
  public recipients: NotificationRecipientRecord[] = [
    { userId: MANAGER_ID, role: OrganizationUserRole.MANAGER },
    { userId: RECEPTION_ID, role: OrganizationUserRole.RECEPTION },
  ];

  public async create(input: CreateNotificationInput): Promise<void> {
    const duplicate = this.notifications.some(
      (notification) =>
        notification.organizationId === input.organizationId &&
        notification.recipientUserId === input.recipientUserId &&
        notification.eventKey === input.eventKey,
    );

    if (!duplicate) {
      this.notifications.push(input);
    }
  }

  public async createMany(
    inputs: readonly CreateNotificationInput[],
  ): Promise<void> {
    for (const input of inputs) {
      await this.create(input);
    }
  }

  public async find(
    organizationId: string,
    recipientUserId: string,
    query: NotificationListQueryDto,
  ): Promise<NotificationDto[]> {
    return this.filtered(organizationId, recipientUserId, query).map(
      (notification) => ({
        id: notification.eventKey,
        organizationId: notification.organizationId,
        recipientUserId: notification.recipientUserId,
        actorUserId: notification.actorUserId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        entityType: notification.entityType,
        entityId: notification.entityId,
        readAt: this.readIds.has(notification.eventKey)
          ? "2026-06-01T09:00:00.000Z"
          : null,
        createdAt: "2026-06-01T08:00:00.000Z",
      }),
    );
  }

  public async count(
    organizationId: string,
    recipientUserId: string,
    query: NotificationListQueryDto,
  ): Promise<number> {
    return this.filtered(organizationId, recipientUserId, query).length;
  }

  public async summarize(
    organizationId: string,
    recipientUserId: string,
  ): Promise<NotificationSummaryDto> {
    const total = await this.count(organizationId, recipientUserId, {
      page: 1,
    });
    const unread = await this.unreadCount(organizationId, recipientUserId);

    return { total, unread, read: total - unread };
  }

  public async unreadCount(
    organizationId: string,
    recipientUserId: string,
  ): Promise<number> {
    return this.notifications.filter(
      (notification) =>
        notification.organizationId === organizationId &&
        notification.recipientUserId === recipientUserId &&
        !this.readIds.has(notification.eventKey),
    ).length;
  }

  public async markRead(
    organizationId: string,
    recipientUserId: string,
    notificationId: string,
  ): Promise<boolean> {
    const notification = this.notifications.find(
      (candidate) =>
        candidate.organizationId === organizationId &&
        candidate.recipientUserId === recipientUserId &&
        candidate.eventKey === notificationId,
    );

    if (!notification) {
      return false;
    }

    this.readIds.add(notification.eventKey);
    return true;
  }

  public async markAllRead(
    organizationId: string,
    recipientUserId: string,
  ): Promise<number> {
    const unread = this.notifications.filter(
      (notification) =>
        notification.organizationId === organizationId &&
        notification.recipientUserId === recipientUserId &&
        !this.readIds.has(notification.eventKey),
    );

    for (const notification of unread) {
      this.readIds.add(notification.eventKey);
    }

    return unread.length;
  }

  public async findActiveRecipientsByRoles(
    _organizationId: string,
    roles: readonly OrganizationUserRole[],
  ): Promise<NotificationRecipientRecord[]> {
    return this.recipients.filter((recipient) =>
      roles.includes(recipient.role),
    );
  }

  private filtered(
    organizationId: string,
    recipientUserId: string,
    query: NotificationListQueryDto,
  ): CreateNotificationInput[] {
    return this.notifications.filter(
      (notification) =>
        notification.organizationId === organizationId &&
        notification.recipientUserId === recipientUserId &&
        (!query.unreadOnly || !this.readIds.has(notification.eventKey)),
    );
  }
}

const createAppointment = (
  overrides: Partial<AppointmentRecord> = {},
): AppointmentRecord => ({
  id: APPOINTMENT_ID,
  organizationId: ORGANIZATION_ID,
  startAt: new Date("2026-06-10T09:00:00.000Z"),
  endAt: new Date("2026-06-10T09:30:00.000Z"),
  status: "SCHEDULED",
  notes: null,
  cancellationReason: null,
  createdByOrgUserId: ACTOR_ID,
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
    id: "88888888-8888-4888-8888-888888888888",
    name: "Kontrola",
    defaultDurationMinutes: 30,
    isActive: true,
  },
  ...overrides,
});

const createService = (): {
  repository: InMemoryNotificationsRepository;
  service: NotificationsService;
} => {
  const repository = new InMemoryNotificationsRepository();
  const service = new NotificationsService(
    repository as unknown as NotificationsRepository,
  );

  return { repository, service };
};

test("creates patient confirmation and doctor notification for patient bookings", async () => {
  const { repository, service } = createService();

  await service.notifyAppointmentCreated({
    appointment: createAppointment(),
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: PATIENT_ID,
      actorRole: OrganizationUserRole.PATIENT,
    },
  });

  assert.deepEqual(
    repository.notifications
      .map((notification) => notification.recipientUserId)
      .sort(),
    [DOCTOR_ID, PATIENT_ID].sort(),
  );
  assert.equal(
    repository.notifications.find(
      (notification) => notification.recipientUserId === PATIENT_ID,
    )?.type,
    "APPOINTMENT_CONFIRMED",
  );
  assert.equal(
    repository.notifications.find(
      (notification) => notification.recipientUserId === DOCTOR_ID,
    )?.type,
    "APPOINTMENT_CONFIRMED",
  );
});

test("creates patient confirmation notification for staff-created appointments", async () => {
  const { repository, service } = createService();

  await service.notifyAppointmentCreated({
    appointment: createAppointment(),
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: RECEPTION_ID,
      actorRole: OrganizationUserRole.RECEPTION,
    },
  });

  assert.equal(repository.notifications.length, 2);
  assert.equal(
    repository.notifications.find(
      (notification) => notification.recipientUserId === PATIENT_ID,
    )?.type,
    "APPOINTMENT_CONFIRMED",
  );
  assert.equal(
    repository.notifications.find(
      (notification) => notification.recipientUserId === DOCTOR_ID,
    )?.type,
    "APPOINTMENT_CONFIRMED",
  );
});

test("creates doctor assignment notification for staff-created appointments", async () => {
  const { repository, service } = createService();

  await service.notifyAppointmentCreated({
    appointment: createAppointment(),
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: RECEPTION_ID,
      actorRole: OrganizationUserRole.RECEPTION,
    },
  });

  assert.ok(
    repository.notifications.some(
      (notification) =>
        notification.recipientUserId === DOCTOR_ID &&
        notification.type === "APPOINTMENT_CONFIRMED",
    ),
  );
});

test("creates update, cancellation, and status-change notifications", async () => {
  const { repository, service } = createService();
  const appointment = createAppointment({
    updatedAt: new Date("2026-06-02T08:00:00.000Z"),
  });

  await service.notifyAppointmentUpdated({
    appointment,
    previousDoctorId: DOCTOR_ID,
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: RECEPTION_ID,
      actorRole: OrganizationUserRole.RECEPTION,
    },
  });
  await service.notifyAppointmentCancelled({
    appointment,
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: PATIENT_ID,
      actorRole: OrganizationUserRole.PATIENT,
    },
  });
  await service.notifyAppointmentStatusChanged({
    appointment: createAppointment({ status: "COMPLETED" }),
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: DOCTOR_ID,
      actorRole: OrganizationUserRole.DOCTOR,
    },
  });

  assert(
    repository.notifications.some(
      (notification) => notification.type === "APPOINTMENT_UPDATED",
    ),
  );
  assert(
    repository.notifications.some(
      (notification) => notification.type === "APPOINTMENT_CANCELLED",
    ),
  );
  assert(
    repository.notifications.some(
      (notification) => notification.type === "APPOINTMENT_STATUS_CHANGED",
    ),
  );
});

test("tracks unread count and marks notifications as read for current user only", async () => {
  const { repository, service } = createService();
  const appointment = createAppointment();

  await service.notifyAppointmentCreated({
    appointment,
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: RECEPTION_ID,
      actorRole: OrganizationUserRole.RECEPTION,
    },
  });

  assert.equal(
    (
      await service.unreadCount({
        organizationId: ORGANIZATION_ID,
        userId: PATIENT_ID,
      })
    ).unreadCount,
    1,
  );

  await service.markAllRead({
    organizationId: ORGANIZATION_ID,
    userId: DOCTOR_ID,
  });
  assert.equal(
    (
      await service.unreadCount({
        organizationId: ORGANIZATION_ID,
        userId: PATIENT_ID,
      })
    ).unreadCount,
    1,
  );

  await service.markAllRead({
    organizationId: ORGANIZATION_ID,
    userId: PATIENT_ID,
  });
  assert.equal(
    (
      await service.unreadCount({
        organizationId: ORGANIZATION_ID,
        userId: PATIENT_ID,
      })
    ).unreadCount,
    0,
  );
});

test("lists only current user's notifications and rejects marking another user's notification", async () => {
  const { service } = createService();
  const appointment = createAppointment();

  await service.notifyAppointmentCreated({
    appointment,
    context: {
      organizationId: ORGANIZATION_ID,
      actorUserId: RECEPTION_ID,
      actorRole: OrganizationUserRole.RECEPTION,
    },
  });

  const patientList = await service.list(
    {
      organizationId: ORGANIZATION_ID,
      userId: PATIENT_ID,
    },
    { page: 1 },
  );
  const doctorList = await service.list(
    {
      organizationId: ORGANIZATION_ID,
      userId: DOCTOR_ID,
    },
    { page: 1 },
  );

  assert.equal(patientList.notifications.length, 1);
  assert.equal(patientList.notifications[0]?.recipientUserId, PATIENT_ID);
  assert.equal(doctorList.notifications.length, 1);
  assert.equal(doctorList.notifications[0]?.recipientUserId, DOCTOR_ID);

  const managerList = await service.list(
    {
      organizationId: ORGANIZATION_ID,
      userId: MANAGER_ID,
    },
    { page: 1 },
  );

  assert.equal(managerList.notifications.length, 0);

  await assert.rejects(
    () =>
      service.markRead(
        {
          organizationId: ORGANIZATION_ID,
          userId: DOCTOR_ID,
        },
        patientList.notifications[0]?.id ?? "",
      ),
    /Notification not found/,
  );
});
