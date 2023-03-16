import { z } from 'zod';

const schema = z.object({
  RUNNABLE_AUTH_SECRET: z.string(),
  FLY_REGION: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  METRICS_PORT: z.string().default('3001'),
});

export type Environment = z.infer<typeof schema>;

export const serverEnv = schema.parse(process.env);
