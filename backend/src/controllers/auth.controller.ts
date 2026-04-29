import type {
  ApiResponse,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  SelectOrganizationRequestDto,
  SelectOrganizationResponseDto,
} from '@zdravstvo/contracts';
import type { Request, Response } from 'express';

import { authService } from '../services/index.js';

export class AuthController {
  public async register(
    request: Request<unknown, ApiResponse<RegisterResponseDto>, RegisterRequestDto>,
    response: Response<ApiResponse<RegisterResponseDto>>
  ): Promise<void> {
    const registrationResponse = await authService.register(request.body);

    response.status(201).json({
      data: registrationResponse,
    });
  }

  public async login(
    request: Request<unknown, ApiResponse<LoginResponseDto>, LoginRequestDto>,
    response: Response<ApiResponse<LoginResponseDto>>
  ): Promise<void> {
    const loginResponse = await authService.login(request.body);

    response.status(200).json({
      data: loginResponse,
    });
  }

  public async selectOrganization(
    request: Request<
      unknown,
      ApiResponse<SelectOrganizationResponseDto>,
      SelectOrganizationRequestDto
    >,
    response: Response<ApiResponse<SelectOrganizationResponseDto>>
  ): Promise<void> {
    const authResponse = await authService.selectOrganization(request.body);

    response.status(200).json({
      data: authResponse,
    });
  }
}

export const authController = new AuthController();
