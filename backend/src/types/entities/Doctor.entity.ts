import type { OrganizationUserRole, UserStatus } from "@zdravstvo/contracts";

export interface DoctorUserRecord {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  status: UserStatus;
}

export interface DoctorProfileRecord {
  userId: string;
  firstName: string;
  lastName: string;
  title: string | null;
  licenseNumber: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationDoctorRecord {
  id: string;
  organizationId: string;
  doctorUserId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface DoctorOrganizationUserRecord {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationUserRole;
  isActive: boolean;
}

export interface DoctorRecord {
  id: string;
  email: string | null;
  phone: string | null;
  userStatus: UserStatus;
  firstName: string;
  lastName: string;
  title: string | null;
  licenseNumber: string | null;
  bio: string | null;
  isActive: boolean;
  organizationDoctorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorWorkingHourRecord {
  id: string;
  organizationId: string;
  doctorUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface DoctorTimeOffRecord {
  id: string;
  organizationId: string;
  doctorUserId: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  createdAt: Date;
}
