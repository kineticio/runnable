import { z } from 'zod';

const validation = z.object({
  servers: z.array(
    z.object({
      namespace: z.string(),
      host: z.string(),
      auth_key: z.string(),
    })
  ),
});

export type AppConfig = z.infer<typeof validation>;

export function validate(config: unknown): AppConfig {
  const validated = validation.parse(config);
  const namespaces = validated.servers.map((server) => server.namespace);
  if (!isUnique(namespaces)) {
    throw new Error('Namespaces must be unique');
  }
  return validated;
}

function isUnique<T>(array: T[]): boolean {
  return new Set(array).size === array.length;
}
