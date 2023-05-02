export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}
