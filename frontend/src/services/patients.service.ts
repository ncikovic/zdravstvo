import type {
  CreatePatientRequestDto,
  PatientDto,
  UpdatePatientRequestDto,
} from "@zdravstvo/contracts";

import { apiClient } from "@/services/api";

export const patientsService = {
  async list(): Promise<PatientDto[]> {
    const response = await apiClient.get<PatientDto[]>("/patients");
    return response.data;
  },

  async getById(patientId: string): Promise<PatientDto> {
    const response = await apiClient.get<PatientDto>(`/patients/${patientId}`);
    return response.data;
  },

  async create(data: CreatePatientRequestDto): Promise<PatientDto> {
    const response = await apiClient.post<PatientDto>("/patients", data);
    return response.data;
  },

  async update(
    patientId: string,
    data: UpdatePatientRequestDto,
  ): Promise<PatientDto> {
    const response = await apiClient.put<PatientDto>(
      `/patients/${patientId}`,
      data,
    );
    return response.data;
  },

  async delete(patientId: string): Promise<void> {
    await apiClient.delete(`/patients/${patientId}`);
  },
};
