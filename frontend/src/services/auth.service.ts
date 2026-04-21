import type {
  ApiResponse,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '@zdravstvo/contracts'

import { apiClient } from '@/services/api'

export class AuthService {
  public async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
      '/auth/login',
      payload,
    )

    return response.data.data
  }

  public async register(
    payload: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const response = await apiClient.post<ApiResponse<RegisterResponseDto>>(
      '/auth/register',
      payload,
    )

    return response.data.data
  }
}

export const authService = new AuthService()
