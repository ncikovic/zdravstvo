import type {
  NotificationListQueryDto,
  NotificationListResponseDto,
} from '@zdravstvo/contracts';

import { notificationsRepository } from '../repositories/index.js';
import type { AuthenticatedRequestContext } from '../shared/context/index.js';

const PAGE_SIZE = 10;

export const notificationsService = {
  async list(
    context: Pick<AuthenticatedRequestContext, 'organizationId'>,
    query: NotificationListQueryDto,
  ): Promise<NotificationListResponseDto> {
    const page = query.page ?? 1;

    const [notifications, totalItems, summary] = await Promise.all([
      notificationsRepository.find(context.organizationId, query),
      notificationsRepository.count(context.organizationId, query),
      notificationsRepository.summarize(context.organizationId),
    ]);

    return {
      notifications,
      summary,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
      totalItems,
    };
  },
};
