import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  status: z.enum(['PENDING', 'SENT', 'FAILED']).optional(),
  channel: z.enum(['EMAIL', 'SMS']).optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type NotificationListQueryDto = z.infer<typeof notificationListQuerySchema>;
