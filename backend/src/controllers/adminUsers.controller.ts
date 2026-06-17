import type {
  AdminOrgUserIdParamsDto,
  AdminUserListQueryDto,
  AdminUserListResponseDto,
  AdminUserResponseDto,
  ApiResponse,
  UpdateAdminUserRequestDto,
} from '@zdravstvo/contracts';
import type { Request, Response } from 'express';

import { adminUsersService } from '../services/index.js';

export class AdminUsersController {
  public async list(
    request: Request,
    response: Response<ApiResponse<AdminUserListResponseDto>>,
  ): Promise<void> {
    const query = request.query as unknown as AdminUserListQueryDto;
    const result = await adminUsersService.list(query);

    response.status(200).json({ data: result });
  }

  public async getById(
    request: Request,
    response: Response<ApiResponse<AdminUserResponseDto>>,
  ): Promise<void> {
    const { orgUserId } = request.params as AdminOrgUserIdParamsDto;
    const user = await adminUsersService.getByOrgUserId(orgUserId);

    response.status(200).json({ data: user });
  }

  public async update(
    request: Request<unknown, ApiResponse<AdminUserResponseDto>, UpdateAdminUserRequestDto>,
    response: Response<ApiResponse<AdminUserResponseDto>>,
  ): Promise<void> {
    const { orgUserId } = request.params as AdminOrgUserIdParamsDto;
    const user = await adminUsersService.update(orgUserId, request.body);

    response.status(200).json({ data: user });
  }

  public async activate(request: Request, response: Response): Promise<void> {
    const { orgUserId } = request.params as AdminOrgUserIdParamsDto;

    await adminUsersService.activate(orgUserId);

    response.status(204).send();
  }

  public async deactivate(request: Request, response: Response): Promise<void> {
    const { orgUserId } = request.params as AdminOrgUserIdParamsDto;

    await adminUsersService.deactivate(orgUserId);

    response.status(204).send();
  }
}

export const adminUsersController = new AdminUsersController();
