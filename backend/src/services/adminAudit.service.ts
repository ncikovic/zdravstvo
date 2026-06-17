import type { AuditListQueryDto, AuditLogDto, AuditLogListResponseDto } from '@zdravstvo/contracts';

import { auditRepository } from '../repositories/index.js';
import { AppError } from '../shared/errors/index.js';

const PAGE_SIZE = 10;

export const adminAuditService = {
  async listAllLogs(query: AuditListQueryDto): Promise<AuditLogListResponseDto> {
    const page = query.page ?? 1;

    const [logs, totalItems] = await Promise.all([
      auditRepository.findAll(query),
      auditRepository.countAll(query),
    ]);

    return {
      logs,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
      totalItems,
    };
  },

  async getLog(id: string): Promise<AuditLogDto> {
    const log = await auditRepository.findByIdGlobal(id);

    if (!log) {
      throw AppError.notFound('Audit log not found.');
    }

    return log;
  },
};
