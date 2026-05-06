import type { ApiResponse, DoctorResponseDto } from '@zdravstvo/contracts'

import { apiClient } from '@/services/api'

export const doctorsService = {
  async getById(doctorId: string): Promise<DoctorResponseDto> {
    const response = await apiClient.get<ApiResponse<DoctorResponseDto>>(
      `/doctors/${doctorId}`,
    )
    return response.data.data
  },
}
