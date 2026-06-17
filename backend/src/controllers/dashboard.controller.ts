import type {
  ApiResponse,
  DashboardQueryDto,
  DashboardResponseDto,
} from "@zdravstvo/contracts";
import type { Request, Response } from "express";

import { dashboardService } from "../services/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";

export class DashboardController {
  public async getCurrent(
    request: Request<
      unknown,
      ApiResponse<DashboardResponseDto>,
      unknown,
      DashboardQueryDto
    >,
    response: Response<ApiResponse<DashboardResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request as Request);
    const dashboard = await dashboardService.getCurrent(
      context,
      request.query,
    );

    response.status(200).json({
      data: dashboard,
    });
  }
}

export const dashboardController = new DashboardController();
