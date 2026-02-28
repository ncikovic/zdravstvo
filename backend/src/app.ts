import express from 'express';

import { apiRouter } from './routes/index.js';
import { errorHandler } from './shared/middleware/errorHandler.middleware.js';
import { notFound } from './shared/middleware/notFound.middleware.js';

export const app = express();

app.use(express.json());
app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);
