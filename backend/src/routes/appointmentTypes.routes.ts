import { OrganizationUserRole } from "@zdravstvo/contracts";
import { Router } from "express";

import { appointmentTypesController } from "../controllers/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  authenticateRequest,
  requireRoles,
} from "../shared/middleware/index.js";

export const appointmentTypesRouter = Router();

const canReadAppointmentTypes = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
  OrganizationUserRole.PATIENT,
);
const canManageAppointmentTypes = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
);

appointmentTypesRouter.get(
  "/",
  authenticateRequest,
  canReadAppointmentTypes,
  asyncHandler(async (request, response) => {
    await appointmentTypesController.listAppointmentTypes(request, response);
  }),
);
appointmentTypesRouter.get(
  "/:id",
  authenticateRequest,
  canReadAppointmentTypes,
  asyncHandler(async (request, response) => {
    await appointmentTypesController.getAppointmentType(request, response);
  }),
);
appointmentTypesRouter.post(
  "/",
  authenticateRequest,
  canManageAppointmentTypes,
  asyncHandler(async (request, response) => {
    await appointmentTypesController.createAppointmentType(request, response);
  }),
);
appointmentTypesRouter.put(
  "/:id",
  authenticateRequest,
  canManageAppointmentTypes,
  asyncHandler(async (request, response) => {
    await appointmentTypesController.updateAppointmentType(request, response);
  }),
);
appointmentTypesRouter.delete(
  "/:id",
  authenticateRequest,
  canManageAppointmentTypes,
  asyncHandler(async (request, response) => {
    await appointmentTypesController.deleteAppointmentType(request, response);
  }),
);
