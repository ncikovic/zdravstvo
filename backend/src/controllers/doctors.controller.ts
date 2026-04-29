import type {
  ApiResponse,
  CreateDoctorRequestDto,
  CreateDoctorTimeOffRequestDto,
  DoctorIdParamsDto,
  DoctorListQueryDto,
  DoctorListResponseDto,
  DoctorResponseDto,
  DoctorTimeOffIdParamsDto,
  DoctorTimeOffListResponseDto,
  DoctorTimeOffResponseDto,
  DoctorWorkingHoursResponseDto,
  ReplaceDoctorWorkingHoursRequestDto,
  UpdateDoctorRequestDto,
} from "@zdravstvo/contracts";
import type { Request, Response } from "express";

import { requireAuthenticatedUser } from "../shared/context/index.js";
import { doctorsService } from "../services/index.js";

export class DoctorsController {
  public async create(
    request: Request<
      unknown,
      ApiResponse<DoctorResponseDto>,
      CreateDoctorRequestDto
    >,
    response: Response<ApiResponse<DoctorResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const doctor = await doctorsService.create(context, request.body);

    response.status(201).json({
      data: doctor,
    });
  }

  public async list(
    request: Request<unknown, ApiResponse<DoctorListResponseDto>>,
    response: Response<ApiResponse<DoctorListResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const doctors = await doctorsService.list(
      context,
      request.query as unknown as DoctorListQueryDto,
    );

    response.status(200).json({
      data: doctors,
    });
  }

  public async getById(
    request: Request,
    response: Response<ApiResponse<DoctorResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as DoctorIdParamsDto;
    const doctor = await doctorsService.getById(context, id);

    response.status(200).json({
      data: doctor,
    });
  }

  public async update(
    request: Request<
      unknown,
      ApiResponse<DoctorResponseDto>,
      UpdateDoctorRequestDto
    >,
    response: Response<ApiResponse<DoctorResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as DoctorIdParamsDto;
    const doctor = await doctorsService.update(context, id, request.body);

    response.status(200).json({
      data: doctor,
    });
  }

  public async listWorkingHours(
    request: Request,
    response: Response<ApiResponse<DoctorWorkingHoursResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as DoctorIdParamsDto;
    const workingHours = await doctorsService.listWorkingHours(context, id);

    response.status(200).json({
      data: workingHours,
    });
  }

  public async replaceWorkingHours(
    request: Request<
      unknown,
      ApiResponse<DoctorWorkingHoursResponseDto>,
      ReplaceDoctorWorkingHoursRequestDto
    >,
    response: Response<ApiResponse<DoctorWorkingHoursResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as DoctorIdParamsDto;
    const workingHours = await doctorsService.replaceWorkingHours(
      context,
      id,
      request.body,
    );

    response.status(200).json({
      data: workingHours,
    });
  }

  public async createTimeOff(
    request: Request<
      unknown,
      ApiResponse<DoctorTimeOffResponseDto>,
      CreateDoctorTimeOffRequestDto
    >,
    response: Response<ApiResponse<DoctorTimeOffResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as DoctorIdParamsDto;
    const timeOff = await doctorsService.createTimeOff(
      context,
      id,
      request.body,
    );

    response.status(201).json({
      data: timeOff,
    });
  }

  public async listTimeOff(
    request: Request,
    response: Response<ApiResponse<DoctorTimeOffListResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id } = request.params as DoctorIdParamsDto;
    const timeOff = await doctorsService.listTimeOff(context, id);

    response.status(200).json({
      data: timeOff,
    });
  }

  public async deleteTimeOff(
    request: Request,
    response: Response,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const { id, timeOffId } = request.params as DoctorTimeOffIdParamsDto;

    await doctorsService.deleteTimeOff(context, id, timeOffId);

    response.status(204).send();
  }
}

export const doctorsController = new DoctorsController();
