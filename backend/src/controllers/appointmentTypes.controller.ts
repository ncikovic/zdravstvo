import type { Request, Response } from "express";

import { appointmentTypesService } from "../services/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";
import {
  createAppointmentTypeSchema,
  idParamsSchema,
  updateAppointmentTypeSchema,
} from "../validations/index.js";

export const appointmentTypesController = {
  async listAppointmentTypes(
    request: Request,
    response: Response,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const appointmentTypes =
      await appointmentTypesService.listAppointmentTypes(context);

    response.status(200).json(appointmentTypes);
  },

  async getAppointmentType(
    request: Request,
    response: Response,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);
    const appointmentType = await appointmentTypesService.getAppointmentType(
      context,
      id,
    );

    response.status(200).json(appointmentType);
  },

  async createAppointmentType(
    request: Request,
    response: Response,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const payload = createAppointmentTypeSchema.parse(request.body);
    const appointmentType = await appointmentTypesService.createAppointmentType(
      context,
      payload,
    );

    response.status(201).json(appointmentType);
  },

  async updateAppointmentType(
    request: Request,
    response: Response,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);
    const payload = updateAppointmentTypeSchema.parse(request.body);
    const appointmentType = await appointmentTypesService.updateAppointmentType(
      context,
      id,
      payload,
    );

    response.status(200).json(appointmentType);
  },

  async deleteAppointmentType(
    request: Request,
    response: Response,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = idParamsSchema.parse(request.params);

    await appointmentTypesService.deleteAppointmentType(context, id);

    response.status(204).send();
  },
};
