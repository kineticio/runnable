import { describe, it, expect } from 'vitest';
import { toOptions } from '../options';

describe('toOptions', () => {
  it('should transform an array into label-value option objects', () => {
    const users = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ];

    const result = toOptions(users, {
      getValue: (user) => user.id,
      getLabel: (user) => user.name,
    });

    expect(result).toEqual([
      { label: 'Alice', value: '1' },
      { label: 'Bob', value: '2' },
      { label: 'Charlie', value: '3' },
    ]);
  });

  it('should handle empty arrays', () => {
    const result = toOptions([], {
      getValue: () => 'value',
      getLabel: () => 'label',
    });

    expect(result).toEqual([]);
  });

  it('should work with different object structures', () => {
    const items = [
      { code: 'US', country: 'United States' },
      { code: 'CA', country: 'Canada' },
    ];

    const result = toOptions(items, {
      getValue: (item) => item.code,
      getLabel: (item) => item.country,
    });

    expect(result).toEqual([
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
    ]);
  });

  it('should handle string arrays', () => {
    const colors = ['red', 'green', 'blue'];

    const result = toOptions(colors, {
      getValue: (color) => color,
      getLabel: (color) => color.toUpperCase(),
    });

    expect(result).toEqual([
      { label: 'RED', value: 'red' },
      { label: 'GREEN', value: 'green' },
      { label: 'BLUE', value: 'blue' },
    ]);
  });

  it('should allow using computed values', () => {
    const numbers = [1, 2, 3];

    const result = toOptions(numbers, {
      getValue: (n) => String(n),
      getLabel: (n) => `Number ${n}`,
    });

    expect(result).toEqual([
      { label: 'Number 1', value: '1' },
      { label: 'Number 2', value: '2' },
      { label: 'Number 3', value: '3' },
    ]);
  });
});
