import type { AuditLogDto } from './AuditLog.dto.js';

export interface AuditLogListResponseDto {
  logs: AuditLogDto[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
