export interface DoctorResponseDto {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  title: string | null;
  licenseNumber: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
