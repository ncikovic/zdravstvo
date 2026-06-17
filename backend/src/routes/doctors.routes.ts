import { OrganizationUserRole } from "@zdravstvo/contracts";
import { Router } from "express";

import { doctorsController } from "../controllers/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  authenticateRequest,
  requireRoles,
} from "../shared/middleware/index.js";
import {
  createDoctorTimeOffValidationSchemas,
  createDoctorValidationSchemas,
  deleteDoctorTimeOffValidationSchemas,
  doctorIdValidationSchemas,
  listDoctorsValidationSchemas,
  replaceDoctorWorkingHoursValidationSchemas,
  updateDoctorSelfValidationSchemas,
  updateDoctorValidationSchemas,
} from "../validations/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";
import { doctorsService } from "../services/index.js";

const canManageDoctors = requireRoles(OrganizationUserRole.MANAGER);
const canListDoctors = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
  OrganizationUserRole.PATIENT,
);
const canReadDoctors = requireRoles(
  OrganizationUserRole.MANAGER,
  OrganizationUserRole.RECEPTION,
);
const canManageDoctorSchedules = requireRoles(OrganizationUserRole.MANAGER);

export const doctorsRouter = Router();

doctorsRouter.post(
  "/doctors",
  authenticateRequest,
  canManageDoctors,
  validateRequest(createDoctorValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.create(request, response);
  }),
);

doctorsRouter.get(
  "/doctors",
  authenticateRequest,
  canListDoctors,
  validateRequest(listDoctorsValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.list(request, response);
  }),
);

doctorsRouter.get(
  "/doctors/me",
  authenticateRequest,
  requireRoles(OrganizationUserRole.DOCTOR),
  asyncHandler(async (request, response) => {
    const context = requireAuthenticatedUser(request);
    const doctor = await doctorsService.getById(context, context.userId);
    response.status(200).json({ data: doctor });
  }),
);

doctorsRouter.patch(
  "/doctors/me",
  authenticateRequest,
  requireRoles(OrganizationUserRole.DOCTOR),
  validateRequest(updateDoctorSelfValidationSchemas),
  asyncHandler(async (request, response) => {
    const context = requireAuthenticatedUser(request);
    const doctor = await doctorsService.update(context, context.userId, request.body);
    response.status(200).json({ data: doctor });
  }),
);

doctorsRouter.get(
  "/doctors/:id",
  authenticateRequest,
  canReadDoctors,
  validateRequest(doctorIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.getById(request, response);
  }),
);

doctorsRouter.patch(
  "/doctors/:id",
  authenticateRequest,
  canManageDoctors,
  validateRequest(updateDoctorValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.update(request, response);
  }),
);

doctorsRouter.get(
  "/doctors/:id/working-hours",
  authenticateRequest,
  canReadDoctors,
  validateRequest(doctorIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.listWorkingHours(request, response);
  }),
);

doctorsRouter.put(
  "/doctors/:id/working-hours",
  authenticateRequest,
  canManageDoctorSchedules,
  validateRequest(replaceDoctorWorkingHoursValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.replaceWorkingHours(request, response);
  }),
);

doctorsRouter.post(
  "/doctors/:id/time-off",
  authenticateRequest,
  canManageDoctorSchedules,
  validateRequest(createDoctorTimeOffValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.createTimeOff(request, response);
  }),
);

doctorsRouter.get(
  "/doctors/:id/time-off",
  authenticateRequest,
  canReadDoctors,
  validateRequest(doctorIdValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.listTimeOff(request, response);
  }),
);

doctorsRouter.delete(
  "/doctors/:id/time-off/:timeOffId",
  authenticateRequest,
  canManageDoctorSchedules,
  validateRequest(deleteDoctorTimeOffValidationSchemas),
  asyncHandler(async (request, response) => {
    await doctorsController.deleteTimeOff(request, response);
  }),
);
