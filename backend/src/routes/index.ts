import { Router } from "express";

import { adminAuditRouter } from "./adminAudit.routes.js";
import { adminUsersRouter } from "./adminUsers.routes.js";
import { appointmentsRouter } from "./appointments.routes.js";
import { appointmentTypesRouter } from "./appointmentTypes.routes.js";
import { auditRouter } from "./audit.routes.js";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { doctorsRouter } from "./doctors.routes.js";
import { healthRouter } from "./health.routes.js";
import { notificationsRouter } from "./notifications.routes.js";
import { organizationsRouter } from "./organizations.routes.js";
import { patientsRouter } from "./patients.routes.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use("/admin/audit", adminAuditRouter);
apiRouter.use("/admin/users", adminUsersRouter);
apiRouter.use("/appointments", appointmentsRouter);
apiRouter.use("/appointment-types", appointmentTypesRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use(dashboardRouter);
apiRouter.use(doctorsRouter);
apiRouter.use(healthRouter);
apiRouter.use(organizationsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/patients", patientsRouter);
