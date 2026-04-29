import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { doctorsRouter } from "./doctors.routes.js";
import { healthRouter } from "./health.routes.js";
import { organizationsRouter } from "./organizations.routes.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(doctorsRouter);
apiRouter.use(healthRouter);
apiRouter.use(organizationsRouter);
