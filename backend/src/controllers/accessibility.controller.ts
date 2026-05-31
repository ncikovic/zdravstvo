import { updateAccessibilitySettingsRequestSchema } from "@zdravstvo/contracts";
import type { Request, Response } from "express";

import { accessibilityService } from "../services/index.js";
import { requireAuthenticatedUser } from "../shared/context/index.js";

export const accessibilityController = {
  async getCurrentUserSettings(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const settings = await accessibilityService.getSettings(context.userId);

    response.status(200).json(settings);
  },

  async updateCurrentUserSettings(request: Request, response: Response): Promise<void> {
    const context = requireAuthenticatedUser(request);
    const payload = updateAccessibilitySettingsRequestSchema.parse(request.body);
    const settings = await accessibilityService.updateSettings(context.userId, payload);

    response.status(200).json(settings);
  },
};
