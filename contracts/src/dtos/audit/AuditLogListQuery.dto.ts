import { z } from 'zod';

export const auditListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  actorOrgUserId: z.string().uuid().optional(),
  entityType: z
    .enum(['APPOINTMENT', 'TYPE', 'DOCTOR', 'ORG_SETTINGS', 'PATIENT'])
    .optional(),
  action: z.enum(['CREATE', 'UPDATE', 'CANCEL', 'STATUS_CHANGE']).optional(),
});

export type AuditListQueryDto = z.infer<typeof auditListQuerySchema>;
