import type { Request, Response } from 'express';

import { patientsService } from '../services/index.js';
import {
  createPatientSchema,
  idParamsSchema,
  updatePatientSchema,
} from '../validations/index.js';

export const patientsController = {
  async listPatients(_request: Request, response: Response): Promise<void> {
    const patients = await patientsService.listPatients();

    response.status(200).json(patients);
  },

  async getPatient(request: Request, response: Response): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);
    const patient = await patientsService.getPatient(id);

    response.status(200).json(patient);
  },

  async createPatient(request: Request, response: Response): Promise<void> {
    const payload = createPatientSchema.parse(request.body);
    const patient = await patientsService.createPatient(payload);

    response.status(201).json(patient);
  },

  async updatePatient(request: Request, response: Response): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);
    const payload = updatePatientSchema.parse(request.body);
    const patient = await patientsService.updatePatient(id, payload);

    response.status(200).json(patient);
  },

  async deletePatient(request: Request, response: Response): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);

    await patientsService.deletePatient(id);

    response.status(204).send();
  },
};
