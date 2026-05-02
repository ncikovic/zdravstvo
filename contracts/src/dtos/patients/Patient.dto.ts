export interface PatientDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: string;
  updatedAt: string;
}
