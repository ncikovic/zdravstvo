import {
  appointmentIdParamsSchema,
  appointmentListQuerySchema,
  availableAppointmentSlotsQuerySchema,
  cancelAppointmentRequestSchema,
  createAppointmentRequestSchema,
  updateAppointmentScheduleRequestSchema,
  updateAppointmentStatusRequestSchema,
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

export const cancelAppointmentValidationSchemas = {
  body: cancelAppointmentRequestSchema,
  params: appointmentIdParamsSchema,
};

export const updateAppointmentStatusValidationSchemas = {
  body: updateAppointmentStatusRequestSchema,
  params: appointmentIdParamsSchema,
};
