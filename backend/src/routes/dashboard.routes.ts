import { OrganizationUserRole } from "@zdravstvo/contracts";
import { Router } from "express";

import { dashboardController } from "../controllers/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  authenticateRequest,
  requireRoles,
} from "../shared/middleware/index.js";

const canReadDashboard = requireRoles(
  OrganizationUserRole.ADMIN,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.DOCTOR,
  OrganizationUserRole.PATIENT,
);

export const dashboardRouter = Router();

dashboardRouter.get(
  "/dashboard",
  authenticateRequest,
  canReadDashboard,
  asyncHandler(async (request, response) => {
    await dashboardController.getCurrent(request, response);
  }),
);
