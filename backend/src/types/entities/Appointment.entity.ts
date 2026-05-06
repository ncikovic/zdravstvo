import type { AppointmentStatusDto } from "@zdravstvo/contracts";

export interface AppointmentDoctorRecord {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  isActive: boolean;
}

export interface AppointmentPatientRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  oib: string | null;
}

export interface AppointmentTypeRecord {
  id: string;
  name: string;
  defaultDurationMinutes: number;
  isActive: boolean;
}

export interface AppointmentRecord {
  id: string;
  organizationId: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatusDto;
  notes: string | null;
  cancellationReason: string | null;
  createdByOrgUserId: string;
  updatedByOrgUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  doctor: AppointmentDoctorRecord;
  patient: AppointmentPatientRecord;
  appointmentType: AppointmentTypeRecord;
}

export interface AppointmentWorkingHourRecord {
  id: string;
  doctorUserId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

export interface AppointmentTimeOffRecord {
  id: string;
  doctorUserId: string;
  startAt: Date;
  endAt: Date;
}

export interface AppointmentOrganizationRecord {
  id: string;
  timezone: string;
}

export interface AppointmentConflictRecord {
  id: string;
  doctorUserId: string;
  patientUserId: string;
  startAt: Date;
  endAt: Date;
}
