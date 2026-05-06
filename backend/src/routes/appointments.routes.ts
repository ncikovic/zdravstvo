import { OrganizationUserRole } from "@zdravstvo/contracts";
import { Router } from "express";

import { appointmentsController } from "../controllers/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  authenticateRequest,
  requireRoles,
} from "../shared/middleware/index.js";
import {
  appointmentIdValidationSchemas,
  availableAppointmentSlotsValidationSchemas,
  createAppointmentValidationSchemas,
  listAppointmentsValidationSchemas,
  updateAppointmentScheduleValidationSchemas,
} from "../validations/index.js";

const canUseAppointments = requireRoles(
  OrganizationUserRole.ADMIN,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
  OrganizationUserRole.PATIENT,
);

export const appointmentsRouter = Router();

appointmentsRouter.use(authenticateRequest, canUseAppointments);

appointmentsRouter.get(
  "/",
  validateRequest(listAppointmentsValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.list(request, response);
  }),
);

appointmentsRouter.get(
  "/available-slots",
  validateRequest(availableAppointmentSlotsValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.findAvailableSlots(request, response);
  }),
);

appointmentsRouter.get(
  "/:id",
  validateRequest(appointmentIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.getById(request, response);
  }),
);

appointmentsRouter.post(
  "/",
  validateRequest(createAppointmentValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.create(request, response);
  }),
);

appointmentsRouter.patch(
  "/:id/schedule",
  validateRequest(updateAppointmentScheduleValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.reschedule(request, response);
  }),
);
