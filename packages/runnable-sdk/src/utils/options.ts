export function toOptions<T>(
  arr: T[],
  opts: { getValue: (item: T) => string; getLabel: (item: T) => string }
): { label: string; value: string }[] {
  return arr.map((item) => ({
    label: opts.getLabel(item),
    value: opts.getValue(item),
  }));
}
