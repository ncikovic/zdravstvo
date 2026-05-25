import {
  createManagerUserRequestSchema,
  managerOrgUserIdParamsSchema,
  managerUserListQuerySchema,
  updateManagerUserRequestSchema,
} from '@zdravstvo/contracts';

export const listManagerUsersValidationSchemas = {
  query: managerUserListQuerySchema,
};

export const managerOrgUserIdValidationSchemas = {
  params: managerOrgUserIdParamsSchema,
};

export const createManagerUserValidationSchemas = {
  body: createManagerUserRequestSchema,
};

export const updateManagerUserValidationSchemas = {
  params: managerOrgUserIdParamsSchema,
  body: updateManagerUserRequestSchema,
};
