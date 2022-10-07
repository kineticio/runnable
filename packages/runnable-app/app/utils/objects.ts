export function keyBy<T>(arr: T[], getKey: (item: T) => string): Record<string, T> {
  const result = {} as Record<string, T>;
  for (const item of arr) {
    result[getKey(item)] = item;
  }
  return result;
}

export function mapValues<T extends object, V>(obj: T, fn: (value: T[keyof T], key: keyof T) => V): Record<string, V> {
  const result = {} as Record<string, any>;
  for (const key of Object.keys(obj)) {
    result[key] = fn(obj[key as keyof T], key as keyof T);
  }
  return result;
}
