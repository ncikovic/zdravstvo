import type { ApiResponse, LoginRequestDto, LoginResponseDto } from '@zdravstvo/contracts'

import { apiClient } from '@/services/api'

export class AuthService {
  public async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
      '/auth/login',
      payload,
    )

    return response.data.data
  }
}

export const authService = new AuthService()
