export interface CreateAppointmentTypeRequestDto {
  name: string;
  defaultDurationMinutes: number;
  isActive?: boolean;
}
