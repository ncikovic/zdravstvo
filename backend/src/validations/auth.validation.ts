import {
  loginRequestSchema,
  registerRequestSchema,
  selectOrganizationRequestSchema,
} from '@zdravstvo/contracts';

export const registerValidationSchemas = {
  body: registerRequestSchema,
};

export const loginValidationSchemas = {
  body: loginRequestSchema,
};

export const selectOrganizationValidationSchemas = {
  body: selectOrganizationRequestSchema,
};
