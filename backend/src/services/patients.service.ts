import type {
  CreatePatientRequestDto,
  PatientDto,
  UpdatePatientRequestDto,
} from '@zdravstvo/contracts';
import { v4 as uuidv4 } from 'uuid';

import { patientsRepository } from '../repositories/index.js';
import { AppError } from '../shared/errors/index.js';
import type { Patient } from '../types/entities/index.js';

const toIsoDateOnly = (value: Date | null): string | null => {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(0, 10);
};

const toPatientDto = (patient: Patient): PatientDto => ({
  id: patient.id,
  firstName: patient.firstName,
  lastName: patient.lastName,
  dateOfBirth: toIsoDateOnly(patient.dateOfBirth),
  oib: patient.oib,
  address: patient.address,
  emergencyContactName: patient.emergencyContactName,
  emergencyContactPhone: patient.emergencyContactPhone,
  createdAt: patient.createdAt.toISOString(),
  updatedAt: patient.updatedAt.toISOString(),
});

export const patientsService = {
  async listPatients(): Promise<PatientDto[]> {
    const patients = await patientsRepository.findAll();

    return patients.map(toPatientDto);
  },

  async getPatient(id: string): Promise<PatientDto> {
    const patient = await patientsRepository.findById(id);

    if (!patient) {
      throw AppError.notFound('Patient not found.');
    }

    return toPatientDto(patient);
  },

  async createPatient(payload: CreatePatientRequestDto): Promise<PatientDto> {
    const patient = await patientsRepository.create({
      ...payload,
      id: payload.id ?? uuidv4(),
    });

    return toPatientDto(patient);
  },

  async updatePatient(
    id: string,
    payload: UpdatePatientRequestDto
  ): Promise<PatientDto> {
    const patient = await patientsRepository.update(id, payload);

    if (!patient) {
      throw AppError.notFound('Patient not found.');
    }

    return toPatientDto(patient);
  },

  async deletePatient(id: string): Promise<void> {
    const deleted = await patientsRepository.delete(id);

    if (!deleted) {
      throw AppError.notFound('Patient not found.');
    }
  },
};
