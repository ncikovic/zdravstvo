import type { OrganizationResponseDto } from './OrganizationResponse.dto.js';

export interface OrganizationListPaginationDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface OrganizationListResponseDto {
  organizations: OrganizationResponseDto[];
  pagination: OrganizationListPaginationDto;
}
