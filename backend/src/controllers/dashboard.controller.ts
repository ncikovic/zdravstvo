import type { ApiResponse, DashboardResponseDto } from "@zdravstvo/contracts";
import type { Request, Response } from "express";

import { dashboardService } from "../services/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";

export class DashboardController {
  public async getCurrent(
    request: Request,
    response: Response<ApiResponse<DashboardResponseDto>>,
  ): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const dashboard = await dashboardService.getCurrent(context);

    response.status(200).json({
      data: dashboard,
    });
  }
}

export const dashboardController = new DashboardController();
