import type {
  ApiResponse,
  CreateManagerUserRequestDto,
  ManagerUserListQueryDto,
  ManagerUserListResponseDto,
  ManagerUserResponseDto,
  UpdateManagerUserRequestDto,
} from '@zdravstvo/contracts';

import { apiClient } from '@/services/api';

export class ManagerUsersService {
  public async list(query: Partial<ManagerUserListQueryDto> = {}): Promise<ManagerUserListResponseDto> {
    const response = await apiClient.get<ApiResponse<ManagerUserListResponseDto>>('/manager/users', {
      params: {
        page: query.page,
        role: query.role || undefined,
        search: query.search || undefined,
      },
    });

    return response.data.data;
  }

  public async create(payload: CreateManagerUserRequestDto): Promise<ManagerUserResponseDto> {
    const response = await apiClient.post<ApiResponse<ManagerUserResponseDto>>(
      '/manager/users',
      payload,
    );

    return response.data.data;
  }

  public async getById(orgUserId: string): Promise<ManagerUserResponseDto> {
    const response = await apiClient.get<ApiResponse<ManagerUserResponseDto>>(
      `/manager/users/${orgUserId}`,
    );

    return response.data.data;
  }

  public async update(
    orgUserId: string,
    payload: UpdateManagerUserRequestDto,
  ): Promise<ManagerUserResponseDto> {
    const response = await apiClient.patch<ApiResponse<ManagerUserResponseDto>>(
      `/manager/users/${orgUserId}`,
      payload,
    );

    return response.data.data;
  }

  public async activate(orgUserId: string): Promise<void> {
    await apiClient.patch(`/manager/users/${orgUserId}/activate`);
  }

  public async deactivate(orgUserId: string): Promise<void> {
    await apiClient.patch(`/manager/users/${orgUserId}/deactivate`);
  }
}

export const managerUsersService = new ManagerUsersService();
export type { ManagerUserResponseDto };
