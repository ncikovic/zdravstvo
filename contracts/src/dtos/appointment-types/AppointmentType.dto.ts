export interface AppointmentTypeDto {
  id: string;
  organizationId: string;
  name: string;
  defaultDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
}
