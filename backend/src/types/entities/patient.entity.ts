import type { UserStatus } from "@zdravstvo/contracts";

export interface Patient {
  id: string;
  email: string | null;
  phone: string | null;
  status: UserStatus;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
