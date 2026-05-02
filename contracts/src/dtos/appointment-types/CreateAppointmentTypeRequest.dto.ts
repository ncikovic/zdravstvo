export interface CreateAppointmentTypeRequestDto {
  organizationId: string;
  name: string;
  defaultDurationMinutes: number;
  isActive?: boolean;
}
