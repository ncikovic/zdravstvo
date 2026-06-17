import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  unreadOnly: z.coerce.boolean().optional(),
});

export type NotificationListQueryDto = z.infer<typeof notificationListQuerySchema>;
