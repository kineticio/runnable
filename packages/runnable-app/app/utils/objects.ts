type MapKey = string | number | symbol;

export function keyBy<T>(arr: T[], getKey: (item: T, idx: number) => MapKey): Record<MapKey, T> {
  const result = {} as Record<MapKey, T>;
  for (const [idx, item] of arr.entries()) {
    result[getKey(item, idx)] = item;
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
