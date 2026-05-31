import type {
  NotificationDto,
  NotificationEntityTypeDto,
  NotificationListQueryDto,
  NotificationSummaryDto,
  NotificationTypeDto,
  OrganizationUserRole,
} from "@zdravstvo/contracts";
import type { Knex } from "knex";
import type { Buffer } from "node:buffer";
import { v4 as uuidv4 } from "uuid";

import type { DatabaseExecutor } from "../shared/db/index.js";
import { db } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";

const PAGE_SIZE = 10;

export interface CreateNotificationInput {
  organizationId: string;
  recipientUserId: string;
  actorUserId: string | null;
  type: NotificationTypeDto;
  title: string;
  message: string;
  entityType: NotificationEntityTypeDto;
  entityId: string;
  eventKey: string;
}

export interface NotificationRecipientRecord {
  userId: string;
  role: OrganizationUserRole;
}

interface NotificationRow {
  id: Buffer | Uint8Array | string;
  organization_id: Buffer | Uint8Array | string;
  recipient_user_id: Buffer | Uint8Array | string;
  actor_user_id: Buffer | Uint8Array | string | null;
  type: NotificationTypeDto;
  title: string;
  message: string;
  entity_type: NotificationEntityTypeDto;
  entity_id: Buffer | Uint8Array | string;
  read_at: Date | string | null;
  created_at: Date | string;
}

interface CountRow {
  total: string | number | bigint;
}

interface RecipientRow {
  user_id: Buffer | Uint8Array | string;
  role: OrganizationUserRole;
}

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const toNullableDate = (value: Date | string | null): Date | null =>
  value === null ? null : toDate(value);

const toDto = (row: NotificationRow): NotificationDto => ({
  id: bufferToUuid(row.id),
  organizationId: bufferToUuid(row.organization_id),
  recipientUserId: bufferToUuid(row.recipient_user_id),
  actorUserId: row.actor_user_id ? bufferToUuid(row.actor_user_id) : null,
  type: row.type,
  title: row.title,
  message: row.message,
  entityType: row.entity_type,
  entityId: bufferToUuid(row.entity_id),
  readAt: toNullableDate(row.read_at)?.toISOString() ?? null,
  createdAt: toDate(row.created_at).toISOString(),
});

const applyListFilters = (
  queryBuilder: Knex.QueryBuilder,
  query: NotificationListQueryDto,
): void => {
  if (query.unreadOnly) {
    queryBuilder.whereNull("read_at");
  }
};

export class NotificationsRepository {
  public constructor(private readonly executor: DatabaseExecutor = db) {}

  public async create(input: CreateNotificationInput): Promise<void> {
    await this.executor("notifications")
      .insert({
        id: uuidToBuffer(uuidv4()),
        organization_id: uuidToBuffer(input.organizationId),
        recipient_user_id: uuidToBuffer(input.recipientUserId),
        actor_user_id: input.actorUserId ? uuidToBuffer(input.actorUserId) : null,
        type: input.type,
        title: input.title,
        message: input.message,
        entity_type: input.entityType,
        entity_id: uuidToBuffer(input.entityId),
        event_key: input.eventKey,
      })
      .onConflict(["organization_id", "recipient_user_id", "event_key"])
      .ignore();
  }

  public async createMany(inputs: readonly CreateNotificationInput[]): Promise<void> {
    for (const input of inputs) {
      await this.create(input);
    }
  }

  private applyOrganizationFilter(
    queryBuilder: Knex.QueryBuilder,
    organizationId: string,
  ): void {
    if (organizationId) {
      queryBuilder.where("organization_id", uuidToBuffer(organizationId));
    }
  }

  public async find(
    organizationId: string,
    recipientUserId: string,
    query: NotificationListQueryDto,
  ): Promise<NotificationDto[]> {
    const page = query.page ?? 1;
    const rowsQuery = this.executor<NotificationRow>("notifications")
      .select(
        "id",
        "organization_id",
        "recipient_user_id",
        "actor_user_id",
        "type",
        "title",
        "message",
        "entity_type",
        "entity_id",
        "read_at",
        "created_at",
      )
      .where({
        recipient_user_id: uuidToBuffer(recipientUserId),
      });

    this.applyOrganizationFilter(rowsQuery, organizationId);
    applyListFilters(rowsQuery, query);

    const rows = await rowsQuery
      .orderBy("created_at", "desc")
      .orderBy("id", "desc")
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE);

    return rows.map(toDto);
  }

  public async count(
    organizationId: string,
    recipientUserId: string,
    query: NotificationListQueryDto,
  ): Promise<number> {
    const countQuery = this.executor("notifications")
      .where({
        recipient_user_id: uuidToBuffer(recipientUserId),
      });

    this.applyOrganizationFilter(countQuery, organizationId);
    applyListFilters(countQuery, query);

    const row = await countQuery.count<CountRow[]>({ total: "id" }).first();

    return row ? Number(row.total) : 0;
  }

  public async unreadCount(
    organizationId: string,
    recipientUserId: string,
  ): Promise<number> {
    const countQuery = this.executor("notifications")
      .where({
        recipient_user_id: uuidToBuffer(recipientUserId),
      })
      .whereNull("read_at");

    this.applyOrganizationFilter(countQuery, organizationId);

    const row = await countQuery.count<CountRow[]>({ total: "id" }).first();

    return row ? Number(row.total) : 0;
  }

  public async summarize(
    organizationId: string,
    recipientUserId: string,
  ): Promise<NotificationSummaryDto> {
    const total = await this.count(organizationId, recipientUserId, { page: 1 });
    const unread = await this.unreadCount(organizationId, recipientUserId);

    return {
      total,
      unread,
      read: total - unread,
    };
  }

  public async markRead(
    organizationId: string,
    recipientUserId: string,
    notificationId: string,
  ): Promise<boolean> {
    const updateQuery = this.executor("notifications")
      .where({
        id: uuidToBuffer(notificationId),
        recipient_user_id: uuidToBuffer(recipientUserId),
      });

    this.applyOrganizationFilter(updateQuery, organizationId);

    const affectedRows = await updateQuery.update({ read_at: new Date() });

    return affectedRows > 0;
  }

  public async markAllRead(
    organizationId: string,
    recipientUserId: string,
  ): Promise<number> {
    const updateQuery = this.executor("notifications")
      .where({
        recipient_user_id: uuidToBuffer(recipientUserId),
      })
      .whereNull("read_at");

    this.applyOrganizationFilter(updateQuery, organizationId);

    return updateQuery.update({ read_at: new Date() });
  }

  public async findActiveRecipientsByRoles(
    organizationId: string,
    roles: readonly OrganizationUserRole[],
  ): Promise<NotificationRecipientRecord[]> {
    if (roles.length === 0) {
      return [];
    }

    const rows = await this.executor<RecipientRow>("organization_users")
      .select("user_id", "role")
      .where("organization_id", uuidToBuffer(organizationId))
      .where("is_active", 1)
      .whereIn("role", roles);

    return rows.map((row) => ({
      userId: bufferToUuid(row.user_id),
      role: row.role,
    }));
  }
}

export const notificationsRepository = new NotificationsRepository();
