import { z } from "zod";

export interface HealthStatusDto {
  ok: true;
}

export const healthCheckQuerySchema = z.object({
  fail: z.enum(["conflict", "error"]).optional(),
});

export type HealthCheckQueryDto = z.infer<typeof healthCheckQuerySchema>;

export * from "./auth.dto.js";
export * from "./doctors/index.js";
export * from "./organizations/index.js";
