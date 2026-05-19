import { adminOrgUserIdParamsSchema, adminUserListQuerySchema } from '@zdravstvo/contracts';

export const listAdminUsersValidationSchemas = {
  query: adminUserListQuerySchema,
};

export const adminOrgUserIdValidationSchemas = {
  params: adminOrgUserIdParamsSchema,
};
