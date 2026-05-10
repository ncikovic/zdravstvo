import type {
  ApiResponse,
  AppointmentAvailableSlotListResponseDto,
  AppointmentListQueryDto,
  AppointmentListResponseDto,
  AppointmentResponseDto,
  AvailableAppointmentSlotsQueryDto,
  CancelAppointmentRequestDto,
  CreateAppointmentRequestDto,
  UpdateAppointmentScheduleRequestDto,
} from "@zdravstvo/contracts";

import { apiClient } from "@/services/api";

export const appointmentsService = {
  async list(
    query: AppointmentListQueryDto = {},
  ): Promise<AppointmentResponseDto[]> {
    const response = await apiClient.get<
      ApiResponse<AppointmentListResponseDto>
    >("/appointments", {
      headers: {
        "Cache-Control": "no-cache",
      },
      params: query,
    });

    return response.data.data.appointments;
  },

  async getById(appointmentId: string): Promise<AppointmentResponseDto> {
    const response = await apiClient.get<ApiResponse<AppointmentResponseDto>>(
      `/appointments/${appointmentId}`,
    );

    return response.data.data;
  },

  async findAvailableSlots(
    query: AvailableAppointmentSlotsQueryDto,
  ): Promise<AppointmentAvailableSlotListResponseDto> {
    const response = await apiClient.get<
      ApiResponse<AppointmentAvailableSlotListResponseDto>
    >("/appointments/available-slots", {
      params: query,
    });

    return response.data.data;
  },

  async create(
    data: CreateAppointmentRequestDto,
  ): Promise<AppointmentResponseDto> {
    const response = await apiClient.post<ApiResponse<AppointmentResponseDto>>(
      "/appointments",
      data,
    );

    return response.data.data;
  },

  async reschedule(
    appointmentId: string,
    data: UpdateAppointmentScheduleRequestDto,
  ): Promise<AppointmentResponseDto> {
    const response = await apiClient.patch<ApiResponse<AppointmentResponseDto>>(
      `/appointments/${appointmentId}/schedule`,
      data,
    );

    return response.data.data;
  },

  async cancel(
    appointmentId: string,
    data: CancelAppointmentRequestDto,
  ): Promise<AppointmentResponseDto> {
    const response = await apiClient.patch<ApiResponse<AppointmentResponseDto>>(
      `/appointments/${appointmentId}/cancel`,
      data,
    );

    return response.data.data;
  },
};
