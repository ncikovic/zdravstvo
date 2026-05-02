export interface UpdateAppointmentTypeRequestDto {
  organizationId?: string;
  name?: string;
  defaultDurationMinutes?: number;
  isActive?: boolean;
}
