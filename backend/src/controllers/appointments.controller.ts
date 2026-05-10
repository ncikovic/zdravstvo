import type {
  ApiResponse,
  AppointmentAvailableSlotListResponseDto,
  AppointmentIdParamsDto,
  AppointmentListQueryDto,
  AppointmentListResponseDto,
  AppointmentResponseDto,
  AvailableAppointmentSlotsQueryDto,
  CancelAppointmentRequestDto,
  CreateAppointmentRequestDto,
  UpdateAppointmentScheduleRequestDto,
} from "@zdravstvo/contracts";
import type { Request, Response } from "express";

import { appointmentsService } from "../services/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";

export class AppointmentsController {
  public async list(
    request: Request<unknown, ApiResponse<AppointmentListResponseDto>>,
    response: Response<ApiResponse<AppointmentListResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const appointments = await appointmentsService.list(
      context,
      request.query as unknown as AppointmentListQueryDto,
    );

    response.status(200).json({
      data: appointments,
    });
  }

  public async getById(
    request: Request,
    response: Response<ApiResponse<AppointmentResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as AppointmentIdParamsDto;
    const appointment = await appointmentsService.getById(context, id);

    response.status(200).json({
      data: appointment,
    });
  }

  public async findAvailableSlots(
    request: Request<
      unknown,
      ApiResponse<AppointmentAvailableSlotListResponseDto>
    >,
    response: Response<ApiResponse<AppointmentAvailableSlotListResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const slots = await appointmentsService.findAvailableSlots(
      context,
      request.query as unknown as AvailableAppointmentSlotsQueryDto,
    );

    response.status(200).json({
      data: slots,
    });
  }

  public async create(
    request: Request<
      unknown,
      ApiResponse<AppointmentResponseDto>,
      CreateAppointmentRequestDto
    >,
    response: Response<ApiResponse<AppointmentResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const appointment = await appointmentsService.create(context, request.body);

    response.status(201).json({
      data: appointment,
    });
  }

  public async reschedule(
    request: Request<
      unknown,
      ApiResponse<AppointmentResponseDto>,
      UpdateAppointmentScheduleRequestDto
    >,
    response: Response<ApiResponse<AppointmentResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as AppointmentIdParamsDto;
    const appointment = await appointmentsService.reschedule(
      context,
      id,
      request.body,
    );

    response.status(200).json({
      data: appointment,
    });
  }

  public async cancel(
    request: Request<
      unknown,
      ApiResponse<AppointmentResponseDto>,
      CancelAppointmentRequestDto
    >,
    response: Response<ApiResponse<AppointmentResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const { id } = request.params as AppointmentIdParamsDto;
    const appointment = await appointmentsService.cancel(
      context,
      id,
      request.body,
    );

    response.status(200).json({
      data: appointment,
    });
  }
}

export const appointmentsController = new AppointmentsController();
