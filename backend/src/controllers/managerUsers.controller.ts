import type {
  ApiResponse,
  CreateManagerUserRequestDto,
  ManagerOrgUserIdParamsDto,
  ManagerUserListQueryDto,
  ManagerUserListResponseDto,
  ManagerUserResponseDto,
  UpdateManagerUserRequestDto,
} from '@zdravstvo/contracts';
import type { Request, Response } from 'express';

import { managerUsersService } from '../services/index.js';
import { requireAuthenticatedUser } from '../shared/context/index.js';

export class ManagerUsersController {
  public async list(
    request: Request,
    response: Response<ApiResponse<ManagerUserListResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const query = request.query as unknown as ManagerUserListQueryDto;
    const result = await managerUsersService.list(context, query);

    response.status(200).json({ data: result });
  }

  public async create(
    request: Request<unknown, ApiResponse<ManagerUserResponseDto>, CreateManagerUserRequestDto>,
    response: Response<ApiResponse<ManagerUserResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const user = await managerUsersService.create(context, request.body);

    response.status(201).json({ data: user });
  }

  public async getById(
    request: Request,
    response: Response<ApiResponse<ManagerUserResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { orgUserId } = request.params as ManagerOrgUserIdParamsDto;
    const user = await managerUsersService.getByOrgUserId(context, orgUserId);

    response.status(200).json({ data: user });
  }

  public async update(
    request: Request<unknown, ApiResponse<ManagerUserResponseDto>, UpdateManagerUserRequestDto>,
    response: Response<ApiResponse<ManagerUserResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { orgUserId } = request.params as ManagerOrgUserIdParamsDto;
    const user = await managerUsersService.update(context, orgUserId, request.body);

    response.status(200).json({ data: user });
  }

  public async activate(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { orgUserId } = request.params as ManagerOrgUserIdParamsDto;

    await managerUsersService.activate(context, orgUserId);

    response.status(204).send();
  }

  public async deactivate(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { orgUserId } = request.params as ManagerOrgUserIdParamsDto;

    await managerUsersService.deactivate(context, orgUserId);

    response.status(204).send();
  }
}

export const managerUsersController = new ManagerUsersController();
