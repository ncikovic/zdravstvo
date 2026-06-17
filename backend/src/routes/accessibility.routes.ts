import { Router } from "express";

import { accessibilityController } from "../controllers/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticateRequest } from "../shared/middleware/index.js";

export const accessibilityRouter = Router();

accessibilityRouter.use(authenticateRequest);

accessibilityRouter.get("/me", asyncHandler(accessibilityController.getCurrentUserSettings));
accessibilityRouter.put("/me", asyncHandler(accessibilityController.updateCurrentUserSettings));
