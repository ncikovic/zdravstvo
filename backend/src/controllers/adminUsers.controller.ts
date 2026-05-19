import type {
  AdminOrgUserIdParamsDto,
  AdminUserListQueryDto,
  AdminUserListResponseDto,
  ApiResponse,
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

  public async deactivate(request: Request, response: Response): Promise<void> {
    const { orgUserId } = request.params as AdminOrgUserIdParamsDto;

    await adminUsersService.deactivate(orgUserId);

    response.status(204).send();
  }
}

export const adminUsersController = new AdminUsersController();
