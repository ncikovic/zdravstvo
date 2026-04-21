import { OrganizationUserRole, UserStatus } from '@zdravstvo/contracts';

export interface UserRecord {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  status: UserStatus;
}

export interface PatientProfileRecord {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface OrganizationUserRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationUserRole;
  isActive: boolean;
}

export interface LoginMembershipRecord {
  organizationId: string;
  role: OrganizationUserRole;
  isActive: boolean;
}
