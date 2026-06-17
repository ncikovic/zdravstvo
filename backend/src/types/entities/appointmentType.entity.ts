export interface AppointmentType {
  id: string;
  organizationId: string;
  name: string;
  defaultDurationMinutes: number;
  isActive: boolean;
  createdAt: Date;
}
