import { z } from "zod";

const dashboardQuerySchema = z.object({
  date: z.iso.date().optional(),
});

export const dashboardValidationSchemas = {
  query: dashboardQuerySchema,
};
