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
  cancelAppointmentValidationSchemas,
  createAppointmentValidationSchemas,
  listAppointmentsValidationSchemas,
  updateAppointmentScheduleValidationSchemas,
  updateAppointmentStatusValidationSchemas,
} from "../validations/index.js";

const canUseAppointments = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
  OrganizationUserRole.PATIENT,
);

const canBookOrCancel = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.PATIENT,
);

const canUpdateStatus = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
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
  canBookOrCancel,
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

appointmentsRouter.patch(
  "/:id/status",
  canUpdateStatus,
  validateRequest(updateAppointmentStatusValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.updateStatus(request, response);
  }),
);

appointmentsRouter.patch(
  "/:id/cancel",
  canBookOrCancel,
  validateRequest(cancelAppointmentValidationSchemas),
  asyncHandler(async (request, response) => {
    await appointmentsController.cancel(request, response);
  }),
);
