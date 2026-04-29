import {
  createDoctorRequestSchema,
  createDoctorTimeOffRequestSchema,
  doctorIdParamsSchema,
  doctorListQuerySchema,
  doctorTimeOffIdParamsSchema,
  replaceDoctorWorkingHoursRequestSchema,
  updateDoctorRequestSchema,
} from "@zdravstvo/contracts";

export const createDoctorValidationSchemas = {
  body: createDoctorRequestSchema,
};

export const listDoctorsValidationSchemas = {
  query: doctorListQuerySchema,
};

export const doctorIdValidationSchemas = {
  params: doctorIdParamsSchema,
};

export const updateDoctorValidationSchemas = {
  body: updateDoctorRequestSchema,
  params: doctorIdParamsSchema,
};

export const replaceDoctorWorkingHoursValidationSchemas = {
  body: replaceDoctorWorkingHoursRequestSchema,
  params: doctorIdParamsSchema,
};

export const createDoctorTimeOffValidationSchemas = {
  body: createDoctorTimeOffRequestSchema,
  params: doctorIdParamsSchema,
};

export const deleteDoctorTimeOffValidationSchemas = {
  params: doctorTimeOffIdParamsSchema,
};
