import {
  appointmentIdParamsSchema,
  appointmentListQuerySchema,
  availableAppointmentSlotsQuerySchema,
  createAppointmentRequestSchema,
  updateAppointmentScheduleRequestSchema,
} from "@zdravstvo/contracts";

export const listAppointmentsValidationSchemas = {
  query: appointmentListQuerySchema,
};

export const appointmentIdValidationSchemas = {
  params: appointmentIdParamsSchema,
};

export const availableAppointmentSlotsValidationSchemas = {
  query: availableAppointmentSlotsQuerySchema,
};

export const createAppointmentValidationSchemas = {
  body: createAppointmentRequestSchema,
};

export const updateAppointmentScheduleValidationSchemas = {
  body: updateAppointmentScheduleRequestSchema,
  params: appointmentIdParamsSchema,
};
