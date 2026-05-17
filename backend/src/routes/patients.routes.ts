import { OrganizationUserRole } from "@zdravstvo/contracts";
import { Router } from "express";

import { patientsController } from "../controllers/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateRequest, requireRoles } from "../shared/middleware/index.js";

const staffOnly = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
);

const staffOrPatient = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.PATIENT,
);

export const patientsRouter = Router();

patientsRouter.use(authenticateRequest);

patientsRouter.get("/", staffOnly, asyncHandler(patientsController.listPatients));
patientsRouter.get("/:id", staffOrPatient, asyncHandler(patientsController.getPatient));
patientsRouter.post("/", staffOnly, asyncHandler(patientsController.createPatient));
patientsRouter.put("/:id", staffOrPatient, asyncHandler(patientsController.updatePatient));
patientsRouter.delete("/:id", staffOnly, asyncHandler(patientsController.deletePatient));
