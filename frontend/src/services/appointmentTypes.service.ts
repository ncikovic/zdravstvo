import type {
  AppointmentTypeDto,
  AppointmentTypeListQueryDto,
  AppointmentTypeListResponseDto,
  CreateAppointmentTypeRequestDto,
  UpdateAppointmentTypeRequestDto,
} from "@zdravstvo/contracts";

import { apiClient } from "@/services/api";

export const appointmentTypesService = {
  async list(
    pageOrQuery: number | AppointmentTypeListQueryDto = 1,
  ): Promise<AppointmentTypeListResponseDto> {
    const query =
      typeof pageOrQuery === "number" ? { page: pageOrQuery } : pageOrQuery;
    const response = await apiClient.get<AppointmentTypeListResponseDto>(
      "/appointment-types",
      {
        params: {
          page: query.page,
          search: query.search || undefined,
          isActive: query.isActive,
          durationMinutes: query.durationMinutes,
        },
      },
    );
    return response.data;
  },

  async getById(appointmentTypeId: string): Promise<AppointmentTypeDto> {
    const response = await apiClient.get<AppointmentTypeDto>(
      `/appointment-types/${appointmentTypeId}`,
    );
    return response.data;
  },

  async create(
    data: CreateAppointmentTypeRequestDto,
  ): Promise<AppointmentTypeDto> {
    const response = await apiClient.post<AppointmentTypeDto>(
      "/appointment-types",
      data,
    );
    return response.data;
  },

  async update(
    appointmentTypeId: string,
    data: UpdateAppointmentTypeRequestDto,
  ): Promise<AppointmentTypeDto> {
    const response = await apiClient.put<AppointmentTypeDto>(
      `/appointment-types/${appointmentTypeId}`,
      data,
    );
    return response.data;
  },

  async delete(appointmentTypeId: string): Promise<void> {
    await apiClient.delete(`/appointment-types/${appointmentTypeId}`);
  },
};
