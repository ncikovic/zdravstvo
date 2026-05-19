import type {
  ApiResponse,
  CreateOrganizationRequestDto,
  OrganizationListPaginationDto,
  OrganizationListQueryDto,
  OrganizationListResponseDto,
  OrganizationResponseDto,
  UpdateOrganizationRequestDto,
} from '@zdravstvo/contracts';

import { apiClient } from '@/services/api';
import type { Organization } from '@/types';

const mapOrganization = (organization: OrganizationResponseDto): Organization => ({
  id: organization.id,
  name: organization.name,
  address: organization.address,
  city: organization.city,
  phone: organization.phone,
  email: organization.email,
  timezone: organization.timezone,
  isActive: organization.isActive,
  createdAt: new Date(organization.createdAt),
  updatedAt: new Date(organization.updatedAt),
});

export interface OrganizationListResult {
  organizations: Organization[];
  pagination: OrganizationListPaginationDto;
}

export class OrganizationsService {
  public async listPublic(query: OrganizationListQueryDto): Promise<OrganizationListResult> {
    const response = await apiClient.get<ApiResponse<OrganizationListResponseDto>>(
      '/organizations/public',
      {
        params: {
          page: query.page,
          search: query.search || undefined,
        },
      },
    );

    return {
      organizations: response.data.data.organizations.map(mapOrganization),
      pagination: response.data.data.pagination,
    };
  }

  public async getById(id: string): Promise<Organization> {
    const response = await apiClient.get<ApiResponse<OrganizationResponseDto>>(
      `/organizations/${id}`,
    );
    return mapOrganization(response.data.data);
  }

  public async listAll(): Promise<Organization[]> {
    const response = await apiClient.get<ApiResponse<OrganizationListResponseDto>>(
      '/organizations',
    );
    return response.data.data.organizations.map(mapOrganization);
  }

  public async create(payload: CreateOrganizationRequestDto): Promise<Organization> {
    const response = await apiClient.post<ApiResponse<OrganizationResponseDto>>(
      '/organizations',
      payload,
    );
    return mapOrganization(response.data.data);
  }

  public async update(id: string, payload: UpdateOrganizationRequestDto): Promise<Organization> {
    const response = await apiClient.patch<ApiResponse<OrganizationResponseDto>>(
      `/organizations/${id}`,
      payload,
    );
    return mapOrganization(response.data.data);
  }

  public async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`);
  }
}

export const organizationsService = new OrganizationsService();
