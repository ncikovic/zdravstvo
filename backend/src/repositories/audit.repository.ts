import type {
  AuditActionDto,
  AuditEntityTypeDto,
  AuditListQueryDto,
  AuditLogDto,
} from '@zdravstvo/contracts';
import type { Buffer } from 'node:buffer';

import { db } from '../shared/db/index.js';
import { bufferToUuid, uuidToBuffer } from '../shared/utils/index.js';

const PAGE_SIZE = 10;

interface AuditLogRow {
  id: Buffer | Uint8Array | string;
  actor_org_user_id: Buffer | Uint8Array | string;
  actor_role: string;
  entity_type: AuditEntityTypeDto;
  action: AuditActionDto;
  entity_id: Buffer | Uint8Array | string;
  metadata: string | null;
  created_at: Date | string;
  doctor_first_name: string | null;
  doctor_last_name: string | null;
  patient_first_name: string | null;
  patient_last_name: string | null;
  user_email: string | null;
}

interface CountRow {
  total: string | number | bigint;
}

const toDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const parseMetadata = (raw: string | null): Record<string, unknown> | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const resolveActorName = (row: AuditLogRow): string => {
  if (row.doctor_first_name && row.doctor_last_name) {
    return `${row.doctor_first_name} ${row.doctor_last_name}`;
  }
  if (row.patient_first_name && row.patient_last_name) {
    return `${row.patient_first_name} ${row.patient_last_name}`;
  }
  return row.user_email ?? 'Unknown';
};

const toAuditLogDto = (row: AuditLogRow): AuditLogDto => ({
  id: bufferToUuid(row.id),
  actorOrgUserId: bufferToUuid(row.actor_org_user_id),
  actorName: resolveActorName(row),
  actorRole: row.actor_role,
  entityType: row.entity_type,
  action: row.action,
  entityId: bufferToUuid(row.entity_id),
  metadata: parseMetadata(row.metadata),
  createdAt: toDate(row.created_at).toISOString(),
});

const buildBaseQuery = (organizationId: string, query: AuditListQueryDto) => {
  let q = db<AuditLogRow>('activity_log as log')
    .innerJoin('organization_users as orgUser', 'orgUser.id', 'log.actor_org_user_id')
    .innerJoin('users as user', 'user.id', 'orgUser.user_id')
    .leftJoin('doctor_profiles as doctor', 'doctor.user_id', 'orgUser.user_id')
    .leftJoin('patient_profiles as patient', 'patient.user_id', 'orgUser.user_id')
    .where('log.organization_id', uuidToBuffer(organizationId));

  if (query.entityType) {
    q = q.andWhere('log.entity_type', query.entityType);
  }

  if (query.action) {
    q = q.andWhere('log.action', query.action);
  }

  if (query.actorOrgUserId) {
    q = q.andWhere('log.actor_org_user_id', uuidToBuffer(query.actorOrgUserId));
  }

  if (query.dateFrom) {
    q = q.andWhere('log.created_at', '>=', new Date(`${query.dateFrom}T00:00:00.000Z`));
  }

  if (query.dateTo) {
    q = q.andWhere('log.created_at', '<', new Date(`${query.dateTo}T23:59:59.999Z`));
  }

  if (query.search) {
    const like = `%${query.search}%`;
    q = q.andWhere((builder) => {
      builder
        .whereRaw("CONCAT(COALESCE(doctor.first_name, ''), ' ', COALESCE(doctor.last_name, '')) LIKE ?", [like])
        .orWhereRaw("CONCAT(COALESCE(patient.first_name, ''), ' ', COALESCE(patient.last_name, '')) LIKE ?", [like])
        .orWhere('user.email', 'like', like);
    });
  }

  return q;
};

export const auditRepository = {
  async findByOrganization(
    organizationId: string,
    query: AuditListQueryDto,
  ): Promise<AuditLogDto[]> {
    const page = query.page ?? 1;
    const offset = (page - 1) * PAGE_SIZE;

    const rows = await buildBaseQuery(organizationId, query)
      .select(
        'log.id',
        'log.actor_org_user_id',
        'orgUser.role as actor_role',
        'log.entity_type',
        'log.action',
        'log.entity_id',
        'log.metadata',
        'log.created_at',
        'doctor.first_name as doctor_first_name',
        'doctor.last_name as doctor_last_name',
        'patient.first_name as patient_first_name',
        'patient.last_name as patient_last_name',
        'user.email as user_email',
      )
      .orderBy('log.created_at', 'desc')
      .orderBy('log.id', 'desc')
      .limit(PAGE_SIZE)
      .offset(offset);

    return rows.map(toAuditLogDto);
  },

  async countByOrganization(
    organizationId: string,
    query: AuditListQueryDto,
  ): Promise<number> {
    const row = await buildBaseQuery(organizationId, query)
      .count<CountRow[]>({ total: 'log.id' })
      .first();

    if (!row) return 0;
    return Number(row.total);
  },

  async findById(
    organizationId: string,
    id: string,
  ): Promise<AuditLogDto | null> {
    const row = await db<AuditLogRow>('activity_log as log')
      .innerJoin('organization_users as orgUser', 'orgUser.id', 'log.actor_org_user_id')
      .innerJoin('users as user', 'user.id', 'orgUser.user_id')
      .leftJoin('doctor_profiles as doctor', 'doctor.user_id', 'orgUser.user_id')
      .leftJoin('patient_profiles as patient', 'patient.user_id', 'orgUser.user_id')
      .select(
        'log.id',
        'log.actor_org_user_id',
        'orgUser.role as actor_role',
        'log.entity_type',
        'log.action',
        'log.entity_id',
        'log.metadata',
        'log.created_at',
        'doctor.first_name as doctor_first_name',
        'doctor.last_name as doctor_last_name',
        'patient.first_name as patient_first_name',
        'patient.last_name as patient_last_name',
        'user.email as user_email',
      )
      .where('log.organization_id', uuidToBuffer(organizationId))
      .andWhere('log.id', uuidToBuffer(id))
      .first();

    return row ? toAuditLogDto(row) : null;
  },
};
