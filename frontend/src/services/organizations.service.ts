import type {
  ApiResponse,
  OrganizationListPaginationDto,
  OrganizationListQueryDto,
  OrganizationListResponseDto,
  OrganizationResponseDto,
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
}

export const organizationsService = new OrganizationsService();
