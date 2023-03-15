import { z } from 'zod';

const schema = z.object({
  // Form
  RUNNABLE_AUTH_PROVIDER_FORM: z.string().optional(),
  // Google
  RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_ID: z.string().optional(),
  RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_SECRET: z.string().optional(),
  RUNNABLE_AUTH_PROVIDER_GOOGLE_HOSTNAME: z.string().optional(),
  RUNNABLE_AUTH_PROVIDER_GOOGLE_HD: z.string().optional(),
});

export type Environment = z.infer<typeof schema>;

export const env = schema.parse(process.env);
