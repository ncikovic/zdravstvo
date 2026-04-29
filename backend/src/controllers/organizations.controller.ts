import type {
  ApiResponse,
  CreateOrganizationRequestDto,
  OrganizationIdParamsDto,
  OrganizationListQueryDto,
  OrganizationListResponseDto,
  OrganizationResponseDto,
  UpdateOrganizationRequestDto,
} from '@zdravstvo/contracts';
import type { Request, Response } from 'express';

import { organizationsService } from '../services/index.js';

export class OrganizationsController {
  public async create(
    request: Request<unknown, ApiResponse<OrganizationResponseDto>, CreateOrganizationRequestDto>,
    response: Response<ApiResponse<OrganizationResponseDto>>,
  ): Promise<void> {
    const organization = await organizationsService.create(request.body);

    response.status(201).json({
      data: organization,
    });
  }

  public async list(
    _request: Request<unknown, ApiResponse<OrganizationListResponseDto>>,
    response: Response<ApiResponse<OrganizationListResponseDto>>,
  ): Promise<void> {
    const organizations = await organizationsService.list();

    response.status(200).json({
      data: organizations,
    });
  }

  public async listPublic(
    request: Request,
    response: Response<ApiResponse<OrganizationListResponseDto>>,
  ): Promise<void> {
    const query = request.query as unknown as OrganizationListQueryDto;
    const organizations = await organizationsService.listPublic(query);

    response.status(200).json({
      data: organizations,
    });
  }

  public async getById(
    request: Request,
    response: Response<ApiResponse<OrganizationResponseDto>>,
  ): Promise<void> {
    const { id } = request.params as OrganizationIdParamsDto;
    const organization = await organizationsService.getById(id);

    response.status(200).json({
      data: organization,
    });
  }

  public async update(
    request: Request<unknown, ApiResponse<OrganizationResponseDto>, UpdateOrganizationRequestDto>,
    response: Response<ApiResponse<OrganizationResponseDto>>,
  ): Promise<void> {
    const { id } = request.params as OrganizationIdParamsDto;
    const organization = await organizationsService.update(id, request.body);

    response.status(200).json({
      data: organization,
    });
  }

  public async delete(request: Request, response: Response): Promise<void> {
    const { id } = request.params as OrganizationIdParamsDto;

    await organizationsService.delete(id);

    response.status(204).send();
  }
}

export const organizationsController = new OrganizationsController();
