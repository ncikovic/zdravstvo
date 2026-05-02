import type {
  AppointmentTypeDto,
  CreateAppointmentTypeRequestDto,
  UpdateAppointmentTypeRequestDto,
} from '@zdravstvo/contracts';
import { v4 as uuidv4 } from 'uuid';

import { appointmentTypesRepository } from '../repositories/index.js';
import { AppError } from '../shared/errors/index.js';
import type { AppointmentType } from '../types/entities/index.js';

const toAppointmentTypeDto = (
  appointmentType: AppointmentType
): AppointmentTypeDto => ({
  id: appointmentType.id,
  organizationId: appointmentType.organizationId,
  name: appointmentType.name,
  defaultDurationMinutes: appointmentType.defaultDurationMinutes,
  isActive: appointmentType.isActive,
  createdAt: appointmentType.createdAt.toISOString(),
});

export const appointmentTypesService = {
  async listAppointmentTypes(): Promise<AppointmentTypeDto[]> {
    const appointmentTypes = await appointmentTypesRepository.findAll();

    return appointmentTypes.map(toAppointmentTypeDto);
  },

  async getAppointmentType(id: string): Promise<AppointmentTypeDto> {
    const appointmentType = await appointmentTypesRepository.findById(id);

    if (!appointmentType) {
      throw AppError.notFound('Appointment type not found.');
    }

    return toAppointmentTypeDto(appointmentType);
  },

  async createAppointmentType(
    payload: CreateAppointmentTypeRequestDto
  ): Promise<AppointmentTypeDto> {
    const appointmentType = await appointmentTypesRepository.create({
      ...payload,
      id: uuidv4(),
    });

    return toAppointmentTypeDto(appointmentType);
  },

  async updateAppointmentType(
    id: string,
    payload: UpdateAppointmentTypeRequestDto
  ): Promise<AppointmentTypeDto> {
    const appointmentType = await appointmentTypesRepository.update(id, payload);

    if (!appointmentType) {
      throw AppError.notFound('Appointment type not found.');
    }

    return toAppointmentTypeDto(appointmentType);
  },

  async deleteAppointmentType(id: string): Promise<void> {
    const deleted = await appointmentTypesRepository.delete(id);

    if (!deleted) {
      throw AppError.notFound('Appointment type not found.');
    }
  },
};
