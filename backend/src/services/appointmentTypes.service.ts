import type {
  AppointmentTypeDto,
  AppointmentTypeListQueryDto,
  AppointmentTypeListResponseDto,
  CreateAppointmentTypeRequestDto,
  UpdateAppointmentTypeRequestDto,
} from "@zdravstvo/contracts";
import { v4 as uuidv4 } from "uuid";

import { appointmentTypesRepository } from "../repositories/index.js";
import type { AuthenticatedRequestContext } from "../shared/context/index.js";
import { AppError } from "../shared/errors/index.js";
import type { AppointmentType } from "../types/entities/index.js";

const toAppointmentTypeDto = (
  appointmentType: AppointmentType,
): AppointmentTypeDto => ({
  id: appointmentType.id,
  organizationId: appointmentType.organizationId,
  name: appointmentType.name,
  defaultDurationMinutes: appointmentType.defaultDurationMinutes,
  isActive: appointmentType.isActive,
  createdAt: appointmentType.createdAt.toISOString(),
});

export const appointmentTypesService = {
  async listAppointmentTypes(
    context: AuthenticatedRequestContext,
    query: AppointmentTypeListQueryDto = { page: 1 },
  ): Promise<AppointmentTypeListResponseDto> {
    const pageSize = 10;
    const page = query.page ?? 1;
    const offset = (page - 1) * pageSize;

    const [appointmentTypes, totalItems] = await Promise.all([
      appointmentTypesRepository.findAllByOrganization(context.organizationId, {
        limit: pageSize,
        offset,
      }),
      appointmentTypesRepository.countAllByOrganization(context.organizationId),
    ]);

    return {
      appointmentTypes: appointmentTypes.map(toAppointmentTypeDto),
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
    };
  },

  async getAppointmentType(
    context: AuthenticatedRequestContext,
    id: string,
  ): Promise<AppointmentTypeDto> {
    const appointmentType = await appointmentTypesRepository.findById(
      context.organizationId,
      id,
    );

    if (!appointmentType) {
      throw AppError.notFound("Appointment type not found.");
    }

    return toAppointmentTypeDto(appointmentType);
  },

  async createAppointmentType(
    context: AuthenticatedRequestContext,
    payload: CreateAppointmentTypeRequestDto,
  ): Promise<AppointmentTypeDto> {
    const appointmentType = await appointmentTypesRepository.create({
      ...payload,
      id: uuidv4(),
      organizationId: context.organizationId,
    });

    return toAppointmentTypeDto(appointmentType);
  },

  async updateAppointmentType(
    context: AuthenticatedRequestContext,
    id: string,
    payload: UpdateAppointmentTypeRequestDto,
  ): Promise<AppointmentTypeDto> {
    const appointmentType = await appointmentTypesRepository.update(
      id,
      context.organizationId,
      payload,
    );

    if (!appointmentType) {
      throw AppError.notFound("Appointment type not found.");
    }

    return toAppointmentTypeDto(appointmentType);
  },

  async deleteAppointmentType(
    context: AuthenticatedRequestContext,
    id: string,
  ): Promise<void> {
    const deleted = await appointmentTypesRepository.delete(
      context.organizationId,
      id,
    );

    if (!deleted) {
      throw AppError.notFound("Appointment type not found.");
    }
  },
};
