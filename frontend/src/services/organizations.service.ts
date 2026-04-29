import type {
  ApiResponse,
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

export class OrganizationsService {
  public async listPublic(): Promise<Organization[]> {
    const response =
      await apiClient.get<ApiResponse<OrganizationListResponseDto>>('/organizations/public');

    return response.data.data.organizations.map(mapOrganization);
  }
}

export const organizationsService = new OrganizationsService();
