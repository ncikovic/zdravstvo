import { z } from 'zod';

export const organizationIdParamsSchema = z.object({
  id: z.uuid(),
});

export type OrganizationIdParamsDto = z.infer<typeof organizationIdParamsSchema>;
