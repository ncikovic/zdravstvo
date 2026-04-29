import {
  createOrganizationRequestSchema,
  organizationIdParamsSchema,
  updateOrganizationRequestSchema,
} from '@zdravstvo/contracts';

export const createOrganizationValidationSchemas = {
  body: createOrganizationRequestSchema,
};

export const listOrganizationsValidationSchemas = {};

export const organizationIdValidationSchemas = {
  params: organizationIdParamsSchema,
};

export const updateOrganizationValidationSchemas = {
  body: updateOrganizationRequestSchema,
  params: organizationIdParamsSchema,
};

export const deleteOrganizationValidationSchemas = {
  params: organizationIdParamsSchema,
};
