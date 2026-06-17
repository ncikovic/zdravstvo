import type { Request, Response } from "express";
import { patientListQuerySchema } from "@zdravstvo/contracts";

import { patientsService } from "../services/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";
import {
  createPatientSchema,
  idParamsSchema,
  updatePatientSchema,
} from "../validations/index.js";

export const patientsController = {
  async listPatients(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const query = patientListQuerySchema.parse(request.query);
    const result = await patientsService.listPatients(context, query);

    response.status(200).json(result);
  },

  async getPatient(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);
    const patient = await patientsService.getPatient(id, {
      organizationId: context.organizationId,
      role: context.role,
      userId: context.userId,
    });

    response.status(200).json(patient);
  },

  async createPatient(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const payload = createPatientSchema.parse(request.body);
    const patient = await patientsService.createPatient(payload, context);

    response.status(201).json(patient);
  },

  async updatePatient(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);
    const payload = updatePatientSchema.parse(request.body);
    const patient = await patientsService.updatePatient(id, payload, {
      organizationId: context.organizationId,
      role: context.role,
      userId: context.userId,
    });

    response.status(200).json(patient);
  },

  async deletePatient(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);

    await patientsService.deletePatient(id, context);

    response.status(204).send();
  },
};
