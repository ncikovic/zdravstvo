export interface OrganizationResponseDto {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
