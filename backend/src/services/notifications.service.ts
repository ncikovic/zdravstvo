import {
  OrganizationUserRole,
  type NotificationListQueryDto,
  type NotificationListResponseDto,
  type NotificationTypeDto,
  type UnreadNotificationCountResponseDto,
} from "@zdravstvo/contracts";

import { AppError } from "../errors/AppError.js";
import {
  NotificationsRepository,
  type CreateNotificationInput,
} from "../repositories/index.js";
import type { AuthenticatedRequestContext } from "../shared/context/index.js";
import { db } from "../shared/db/index.js";
import type { AppointmentRecord } from "../types/entities/index.js";

const PAGE_SIZE = 10;
const STAFF_NOTIFICATION_ROLES: readonly OrganizationUserRole[] = [
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
];

type NotificationsRequestContext = Pick<
  AuthenticatedRequestContext,
  "organizationId" | "userId"
>;

interface AppointmentNotificationContext {
  organizationId: string;
  actorUserId: string | null;
  actorRole: OrganizationUserRole | null;
}

interface AppointmentNotificationInput {
  appointment: AppointmentRecord;
  context: AppointmentNotificationContext;
}

const formatAppointmentTime = (appointment: AppointmentRecord): string =>
  new Intl.DateTimeFormat("hr-HR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  }).format(appointment.startAt);

const createAppointmentMessage = (
  appointment: AppointmentRecord,
  prefix: string,
): string => {
  const doctorName = appointment.doctor.title
    ? `${appointment.doctor.title} ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;

  return `${prefix}: ${appointment.appointmentType.name}, ${formatAppointmentTime(appointment)}, ${doctorName}.`;
};

const eventKey = (
  appointmentId: string,
  type: NotificationTypeDto,
  suffix: string,
): string => `${appointmentId}:${type}:${suffix}`;

const uniqueRecipients = (recipients: readonly string[]): string[] => [
  ...new Set(recipients),
];

export class NotificationsService {
  public constructor(
    private readonly notificationsRepository: NotificationsRepository = new NotificationsRepository(
      db,
    ),
  ) {}

  public async list(
    context: NotificationsRequestContext,
    query: NotificationListQueryDto,
  ): Promise<NotificationListResponseDto> {
    const page = query.page ?? 1;

    const [notifications, totalItems, summary] = await Promise.all([
      this.notificationsRepository.find(
        context.organizationId,
        context.userId,
        query,
      ),
      this.notificationsRepository.count(
        context.organizationId,
        context.userId,
        query,
      ),
      this.notificationsRepository.summarize(
        context.organizationId,
        context.userId,
      ),
    ]);

    return {
      notifications,
      summary,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
      totalItems,
    };
  }

  public async unreadCount(
    context: NotificationsRequestContext,
  ): Promise<UnreadNotificationCountResponseDto> {
    return {
      unreadCount: await this.notificationsRepository.unreadCount(
        context.organizationId,
        context.userId,
      ),
    };
  }

  public async markRead(
    context: NotificationsRequestContext,
    notificationId: string,
  ): Promise<void> {
    const updated = await this.notificationsRepository.markRead(
      context.organizationId,
      context.userId,
      notificationId,
    );

    if (!updated) {
      throw AppError.notFound("Notification not found.");
    }
  }

  public async markAllRead(
    context: NotificationsRequestContext,
  ): Promise<void> {
    await this.notificationsRepository.markAllRead(
      context.organizationId,
      context.userId,
    );
  }

  public async notifyAppointmentCreated(
    input: AppointmentNotificationInput,
  ): Promise<void> {
    const { appointment, context } = input;
    const notifications: CreateNotificationInput[] = [
      this.buildAppointmentNotification({
        appointment,
        context,
        recipientUserId: appointment.patient.id,
        type: "APPOINTMENT_CONFIRMED",
        title: "Appointment confirmed",
        message: createAppointmentMessage(
          appointment,
          "Your appointment has been confirmed",
        ),
        eventSuffix: "patient-confirmed",
      }),
    ];

    if (appointment.doctor.id !== context.actorUserId) {
      notifications.push(
        this.buildAppointmentNotification({
          appointment,
          context,
          recipientUserId: appointment.doctor.id,
          type: "APPOINTMENT_CONFIRMED",
          title: "New scheduled appointment",
          message: createAppointmentMessage(
            appointment,
            `${appointment.patient.firstName} ${appointment.patient.lastName} booked an appointment`,
          ),
          eventSuffix: `doctor-scheduled-${appointment.createdAt.toISOString()}`,
        }),
      );
    }

    await this.notificationsRepository.createMany(notifications);
  }

  public async notifyAppointmentUpdated(
    input: AppointmentNotificationInput & { previousDoctorId: string },
  ): Promise<void> {
    const { appointment, context, previousDoctorId } = input;
    const staffRecipients = uniqueRecipients([
      appointment.doctor.id,
      previousDoctorId,
    ]).filter((recipientUserId) => recipientUserId !== context.actorUserId);
    const notifications: CreateNotificationInput[] = [
      this.buildAppointmentNotification({
        appointment,
        context,
        recipientUserId: appointment.patient.id,
        type: "APPOINTMENT_UPDATED",
        title: "Appointment updated",
        message: createAppointmentMessage(
          appointment,
          "Your appointment has been updated",
        ),
        eventSuffix: `patient-updated-${appointment.updatedAt.toISOString()}`,
      }),
      ...staffRecipients.map((recipientUserId) =>
        this.buildAppointmentNotification({
          appointment,
          context,
          recipientUserId,
          type: "APPOINTMENT_UPDATED",
          title: "Appointment updated",
          message: createAppointmentMessage(
            appointment,
            `${appointment.patient.firstName} ${appointment.patient.lastName}'s appointment was updated`,
          ),
          eventSuffix: `staff-updated-${appointment.updatedAt.toISOString()}`,
        }),
      ),
    ];

    await this.notificationsRepository.createMany(notifications);
  }

  public async notifyAppointmentCancelled(
    input: AppointmentNotificationInput,
  ): Promise<void> {
    const { appointment, context } = input;
    const recipients =
      context.actorRole === OrganizationUserRole.PATIENT
        ? await this.buildStaffNotifications({
            appointment,
            context,
            type: "APPOINTMENT_CANCELLED",
            title: "Appointment cancelled",
            message: createAppointmentMessage(
              appointment,
              `${appointment.patient.firstName} ${appointment.patient.lastName} cancelled an appointment`,
            ),
            eventSuffix: `staff-cancelled-${appointment.updatedAt.toISOString()}`,
          })
        : [
            this.buildAppointmentNotification({
              appointment,
              context,
              recipientUserId: appointment.patient.id,
              type: "APPOINTMENT_CANCELLED",
              title: "Appointment cancelled",
              message: createAppointmentMessage(
                appointment,
                "Your appointment has been cancelled",
              ),
              eventSuffix: `patient-cancelled-${appointment.updatedAt.toISOString()}`,
            }),
          ];

    await this.notificationsRepository.createMany(recipients);
  }

  public async notifyAppointmentStatusChanged(
    input: AppointmentNotificationInput,
  ): Promise<void> {
    const { appointment, context } = input;
    const readableStatus =
      appointment.status === "COMPLETED" ? "completed" : "marked as no-show";

    await this.notificationsRepository.create(
      this.buildAppointmentNotification({
        appointment,
        context,
        recipientUserId: appointment.patient.id,
        type: "APPOINTMENT_STATUS_CHANGED",
        title: "Appointment status updated",
        message: createAppointmentMessage(
          appointment,
          `Your appointment was ${readableStatus}`,
        ),
        eventSuffix: `patient-status-${appointment.status}`,
      }),
    );
  }

  private buildAppointmentNotification(input: {
    appointment: AppointmentRecord;
    context: AppointmentNotificationContext;
    recipientUserId: string;
    type: NotificationTypeDto;
    title: string;
    message: string;
    eventSuffix: string;
  }): CreateNotificationInput {
    return {
      organizationId: input.context.organizationId,
      recipientUserId: input.recipientUserId,
      actorUserId: input.context.actorUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: "APPOINTMENT",
      entityId: input.appointment.id,
      eventKey: eventKey(input.appointment.id, input.type, input.eventSuffix),
    };
  }

  private async buildStaffNotifications(input: {
    appointment: AppointmentRecord;
    context: AppointmentNotificationContext;
    type: NotificationTypeDto;
    title: string;
    message: string;
    eventSuffix: string;
  }): Promise<CreateNotificationInput[]> {
    const staff =
      await this.notificationsRepository.findActiveRecipientsByRoles(
        input.context.organizationId,
        STAFF_NOTIFICATION_ROLES,
      );
    const recipientIds = uniqueRecipients([
      ...staff.map((recipient) => recipient.userId),
      input.appointment.doctor.id,
    ]).filter(
      (recipientUserId) => recipientUserId !== input.context.actorUserId,
    );

    return recipientIds.map((recipientUserId) =>
      this.buildAppointmentNotification({
        appointment: input.appointment,
        context: input.context,
        recipientUserId,
        type: input.type,
        title: input.title,
        message: input.message,
        eventSuffix: input.eventSuffix,
      }),
    );
  }
}

export const notificationsService = new NotificationsService();
