import {
  adminOrgUserIdParamsSchema,
  adminUserListQuerySchema,
  updateAdminUserRequestSchema,
} from '@zdravstvo/contracts';

export const listAdminUsersValidationSchemas = {
  query: adminUserListQuerySchema,
};

export const adminOrgUserIdValidationSchemas = {
  params: adminOrgUserIdParamsSchema,
};

export const updateAdminUserValidationSchemas = {
  params: adminOrgUserIdParamsSchema,
  body: updateAdminUserRequestSchema,
};
