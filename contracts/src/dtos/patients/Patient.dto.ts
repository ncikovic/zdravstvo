import type { UserStatus } from "../../enums/index.js";

export interface PatientDto {
  id: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
