import type { UserStatus } from "../../enums/index.js";

export interface UpdatePatientRequestDto {
  email?: string | null;
  phone?: string | null;
  status?: UserStatus;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  oib?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}
