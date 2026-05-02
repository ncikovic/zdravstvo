import { Router } from 'express';

import { patientsController } from '../controllers/index.js';

export const patientsRouter = Router();

patientsRouter.get('/', patientsController.listPatients);
patientsRouter.get('/:id', patientsController.getPatient);
patientsRouter.post('/', patientsController.createPatient);
patientsRouter.put('/:id', patientsController.updatePatient);
patientsRouter.delete('/:id', patientsController.deletePatient);
