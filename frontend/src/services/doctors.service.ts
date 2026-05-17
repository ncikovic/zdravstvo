import type {
  ApiResponse,
  CreateDoctorRequestDto,
  CreateDoctorTimeOffRequestDto,
  DoctorListResponseDto,
  DoctorResponseDto,
  DoctorTimeOffListResponseDto,
  DoctorWorkingHoursResponseDto,
  ReplaceDoctorWorkingHoursRequestDto,
} from '@zdravstvo/contracts'

import { apiClient } from '@/services/api'

export const doctorsService = {
  async list(page = 1): Promise<DoctorListResponseDto> {
    const response = await apiClient.get<ApiResponse<DoctorListResponseDto>>(
      `/doctors?page=${page}`,
    )
    return response.data.data
  },

  async getById(doctorId: string): Promise<DoctorResponseDto> {
    const response = await apiClient.get<ApiResponse<DoctorResponseDto>>(
      `/doctors/${doctorId}`,
    )
    return response.data.data
  },

  async create(
    data: CreateDoctorRequestDto,
  ): Promise<DoctorResponseDto> {
    const response = await apiClient.post<ApiResponse<DoctorResponseDto>>(
      '/doctors',
      data,
    )
    return response.data.data
  },

  async update(
    doctorId: string,
    data: Partial<CreateDoctorRequestDto>,
  ): Promise<DoctorResponseDto> {
    const response = await apiClient.patch<ApiResponse<DoctorResponseDto>>(
      `/doctors/${doctorId}`,
      data,
    )
    return response.data.data
  },

  async listWorkingHours(doctorId: string): Promise<DoctorWorkingHoursResponseDto> {
    const response = await apiClient.get<ApiResponse<DoctorWorkingHoursResponseDto>>(
      `/doctors/${doctorId}/working-hours`,
    )
    return response.data.data
  },

  async replaceWorkingHours(
    doctorId: string,
    data: ReplaceDoctorWorkingHoursRequestDto,
  ): Promise<DoctorWorkingHoursResponseDto> {
    const response = await apiClient.put<ApiResponse<DoctorWorkingHoursResponseDto>>(
      `/doctors/${doctorId}/working-hours`,
      data,
    )
    return response.data.data
  },

  async listTimeOff(doctorId: string): Promise<DoctorTimeOffListResponseDto> {
    const response = await apiClient.get<ApiResponse<DoctorTimeOffListResponseDto>>(
      `/doctors/${doctorId}/time-off`,
    )
    return response.data.data
  },

  async createTimeOff(
    doctorId: string,
    data: CreateDoctorTimeOffRequestDto,
  ): Promise<DoctorTimeOffListResponseDto> {
    const response = await apiClient.post<ApiResponse<DoctorTimeOffListResponseDto>>(
      `/doctors/${doctorId}/time-off`,
      data,
    )
    return response.data.data
  },

  async deleteTimeOff(doctorId: string, timeOffId: string): Promise<void> {
    await apiClient.delete(`/doctors/${doctorId}/time-off/${timeOffId}`)
  },
}
