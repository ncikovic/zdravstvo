import { z } from 'zod';

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const organizationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  search: z.preprocess(emptyStringToUndefined, z.string().trim().max(120).optional()),
});

export type OrganizationListQueryDto = z.infer<typeof organizationListQuerySchema>;
