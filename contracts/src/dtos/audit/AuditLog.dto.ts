export type AuditEntityTypeDto =
  | 'APPOINTMENT'
  | 'TYPE'
  | 'DOCTOR'
  | 'ORG_SETTINGS'
  | 'PATIENT';

export type AuditActionDto = 'CREATE' | 'UPDATE' | 'CANCEL' | 'STATUS_CHANGE';

export interface AuditLogDto {
  id: string;
  actorOrgUserId: string;
  actorName: string;
  actorRole: string;
  entityType: AuditEntityTypeDto;
  action: AuditActionDto;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
