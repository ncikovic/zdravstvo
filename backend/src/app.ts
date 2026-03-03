import express from 'express';

import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

export const app = express();

app.use(express.json());
app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);
