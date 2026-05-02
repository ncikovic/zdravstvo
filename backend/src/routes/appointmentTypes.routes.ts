import { Router } from 'express';

import { appointmentTypesController } from '../controllers/index.js';

export const appointmentTypesRouter = Router();

appointmentTypesRouter.get('/', appointmentTypesController.listAppointmentTypes);
appointmentTypesRouter.get('/:id', appointmentTypesController.getAppointmentType);
appointmentTypesRouter.post('/', appointmentTypesController.createAppointmentType);
appointmentTypesRouter.put('/:id', appointmentTypesController.updateAppointmentType);
appointmentTypesRouter.delete('/:id', appointmentTypesController.deleteAppointmentType);
