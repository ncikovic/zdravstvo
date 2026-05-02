import type { Request, Response } from 'express';

import { appointmentTypesService } from '../services/index.js';
import {
  createAppointmentTypeSchema,
  idParamsSchema,
  updateAppointmentTypeSchema,
} from '../validations/index.js';

export const appointmentTypesController = {
  async listAppointmentTypes(
    _request: Request,
    response: Response
  ): Promise<void> {
    const appointmentTypes =
      await appointmentTypesService.listAppointmentTypes();

    response.status(200).json(appointmentTypes);
  },

  async getAppointmentType(request: Request, response: Response): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);
    const appointmentType = await appointmentTypesService.getAppointmentType(id);

    response.status(200).json(appointmentType);
  },

  async createAppointmentType(
    request: Request,
    response: Response
  ): Promise<void> {
    const payload = createAppointmentTypeSchema.parse(request.body);
    const appointmentType =
      await appointmentTypesService.createAppointmentType(payload);

    response.status(201).json(appointmentType);
  },

  async updateAppointmentType(
    request: Request,
    response: Response
  ): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);
    const payload = updateAppointmentTypeSchema.parse(request.body);
    const appointmentType =
      await appointmentTypesService.updateAppointmentType(id, payload);

    response.status(200).json(appointmentType);
  },

  async deleteAppointmentType(
    request: Request,
    response: Response
  ): Promise<void> {
    const { id } = idParamsSchema.parse(request.params);

    await appointmentTypesService.deleteAppointmentType(id);

    response.status(204).send();
  },
};
