export function assertExists<T>(value: T | undefined | null, message?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Response(message, {
      status: 404,
    });
  }
}
