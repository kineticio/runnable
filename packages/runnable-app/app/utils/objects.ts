export function groupBy<T>(arr: T[], getKey: (item: T) => string): Record<string, T[]> {
  const result = {} as Record<string, T[]>;
  for (const item of arr) {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}
