import { Router } from "express";

import { appointmentTypesRouter } from "./appointmentTypes.routes.js";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { doctorsRouter } from "./doctors.routes.js";
import { healthRouter } from "./health.routes.js";
import { organizationsRouter } from "./organizations.routes.js";
import { patientsRouter } from "./patients.routes.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use("/appointment-types", appointmentTypesRouter);
apiRouter.use(dashboardRouter);
apiRouter.use(doctorsRouter);
apiRouter.use(healthRouter);
apiRouter.use(organizationsRouter);
apiRouter.use("/patients", patientsRouter);
