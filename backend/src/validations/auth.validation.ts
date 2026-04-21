import {
  loginRequestSchema,
  registerRequestSchema,
} from '@zdravstvo/contracts';

export const registerValidationSchemas = {
  body: registerRequestSchema,
};

export const loginValidationSchemas = {
  body: loginRequestSchema,
};
