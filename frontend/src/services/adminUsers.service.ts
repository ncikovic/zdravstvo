import type {
  AdminUserListQueryDto,
  AdminUserListResponseDto,
  AdminUserResponseDto,
  ApiResponse,
  UpdateAdminUserRequestDto,
} from '@zdravstvo/contracts';

import { apiClient } from '@/services/api';

export class AdminUsersService {
  public async list(query: Partial<AdminUserListQueryDto> = {}): Promise<AdminUserListResponseDto> {
    const response = await apiClient.get<ApiResponse<AdminUserListResponseDto>>('/admin/users', {
      params: {
        page: query.page,
        organizationId: query.organizationId || undefined,
        role: query.role || undefined,
        search: query.search || undefined,
      },
    });

    return response.data.data;
  }

  public async getById(orgUserId: string): Promise<AdminUserResponseDto> {
    const response = await apiClient.get<ApiResponse<AdminUserResponseDto>>(
      `/admin/users/${orgUserId}`,
    );

    return response.data.data;
  }

  public async update(
    orgUserId: string,
    payload: UpdateAdminUserRequestDto,
  ): Promise<AdminUserResponseDto> {
    const response = await apiClient.patch<ApiResponse<AdminUserResponseDto>>(
      `/admin/users/${orgUserId}`,
      payload,
    );

    return response.data.data;
  }

  public async activate(orgUserId: string): Promise<void> {
    await apiClient.patch(`/admin/users/${orgUserId}/activate`);
  }

  public async deactivate(orgUserId: string): Promise<void> {
    await apiClient.patch(`/admin/users/${orgUserId}/deactivate`);
  }
}

export const adminUsersService = new AdminUsersService();
export type { AdminUserResponseDto };
