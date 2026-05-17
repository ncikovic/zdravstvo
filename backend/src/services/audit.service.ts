import type {
  AuditListQueryDto,
  AuditLogDto,
  AuditLogListResponseDto,
} from '@zdravstvo/contracts';

import { auditRepository } from '../repositories/index.js';
import { AppError } from '../shared/errors/index.js';
import type { AuthenticatedRequestContext } from '../shared/context/index.js';

const PAGE_SIZE = 10;

export const auditService = {
  async listLogs(
    context: Pick<AuthenticatedRequestContext, 'organizationId'>,
    query: AuditListQueryDto,
  ): Promise<AuditLogListResponseDto> {
    const page = query.page ?? 1;

    const [logs, totalItems] = await Promise.all([
      auditRepository.findByOrganization(context.organizationId, query),
      auditRepository.countByOrganization(context.organizationId, query),
    ]);

    return {
      logs,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
      totalItems,
    };
  },

  async getLog(
    id: string,
    context: Pick<AuthenticatedRequestContext, 'organizationId'>,
  ): Promise<AuditLogDto> {
    const log = await auditRepository.findById(context.organizationId, id);

    if (!log) {
      throw AppError.notFound('Audit log not found.');
    }

    return log;
  },
};
