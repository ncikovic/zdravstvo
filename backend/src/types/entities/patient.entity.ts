export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  oib: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
