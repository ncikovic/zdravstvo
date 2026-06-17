import { z } from "zod";

export interface HealthStatusDto {
  ok: true;
}

export const healthCheckQuerySchema = z.object({
  fail: z.enum(["conflict", "error"]).optional(),
});

export type HealthCheckQueryDto = z.infer<typeof healthCheckQuerySchema>;
