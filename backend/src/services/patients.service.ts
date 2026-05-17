import type {
  CreatePatientRequestDto,
  PatientDto,
  PatientListQueryDto,
  PatientListResponseDto,
  UpdatePatientRequestDto,
} from "@zdravstvo/contracts";
import { OrganizationUserRole } from "@zdravstvo/contracts";
import { v4 as uuidv4 } from "uuid";

import { patientsRepository } from "../repositories/index.js";
import { AppError } from "../shared/errors/index.js";
import type { AuthenticatedRequestContext } from "../shared/context/index.js";
import type { Patient } from "../types/entities/index.js";

const toIsoDateOnly = (value: Date | null): string | null => {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(0, 10);
};

const toPatientDto = (patient: Patient): PatientDto => ({
  id: patient.id,
  email: patient.email,
  phone: patient.phone,
  status: patient.status,
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
  async listPatients(
    context: Pick<AuthenticatedRequestContext, "organizationId">,
    query: PatientListQueryDto = { page: 1 },
  ): Promise<PatientListResponseDto> {
    const pageSize = 10;
    const page = query.page ?? 1;
    const offset = (page - 1) * pageSize;

    const [patients, totalItems] = await Promise.all([
      patientsRepository.findActiveByOrganization(context.organizationId, {
        limit: pageSize,
        offset,
      }),
      patientsRepository.countActiveByOrganization(context.organizationId),
    ]);

    return {
      patients: patients.map(toPatientDto),
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
    };
  },

  async getPatient(
    id: string,
    context?: Pick<AuthenticatedRequestContext, "organizationId" | "role" | "userId">,
  ): Promise<PatientDto> {
    if (context?.role === OrganizationUserRole.PATIENT && id !== context.userId) {
      throw AppError.forbidden();
    }

    const patient = context
      ? await patientsRepository.findActiveByOrganizationAndId(
          context.organizationId,
          id,
        )
      : await patientsRepository.findById(id);

    if (!patient) {
      throw AppError.notFound("Patient not found.");
    }

    return toPatientDto(patient);
  },

  async createPatient(
    payload: CreatePatientRequestDto,
    context?: Pick<AuthenticatedRequestContext, "organizationId">,
  ): Promise<PatientDto> {
    const patient = await patientsRepository.create({
      ...payload,
      id: payload.id ?? uuidv4(),
      organizationId: context?.organizationId,
    });

    return toPatientDto(patient);
  },

  async updatePatient(
    id: string,
    payload: UpdatePatientRequestDto,
    context?: Pick<AuthenticatedRequestContext, "organizationId" | "role" | "userId">,
  ): Promise<PatientDto> {
    if (context?.role === OrganizationUserRole.PATIENT && id !== context.userId) {
      throw AppError.forbidden();
    }

    if (context) {
      const existingPatient =
        await patientsRepository.findActiveByOrganizationAndId(
          context.organizationId,
          id,
        );

      if (!existingPatient) {
        throw AppError.notFound("Patient not found.");
      }
    }

    const patient = await patientsRepository.update(id, payload);

    if (!patient) {
      throw AppError.notFound("Patient not found.");
    }

    return toPatientDto(patient);
  },

  async deletePatient(
    id: string,
    context?: Pick<AuthenticatedRequestContext, "organizationId">,
  ): Promise<void> {
    if (context) {
      const existingPatient =
        await patientsRepository.findActiveByOrganizationAndId(
          context.organizationId,
          id,
        );

      if (!existingPatient) {
        throw AppError.notFound("Patient not found.");
      }
    }

    const deleted = await patientsRepository.delete(id);

    if (!deleted) {
      throw AppError.notFound("Patient not found.");
    }
  },
};
