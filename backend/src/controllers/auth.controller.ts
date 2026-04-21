import type { ApiResponse, RegisterRequestDto, RegisterResponseDto } from '@zdravstvo/contracts';
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
}

export const authController = new AuthController();
