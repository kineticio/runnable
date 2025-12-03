import { describe, it, expect } from 'vitest';
import { keyBy, mapValues } from '../objects';

describe('keyBy', () => {
  it('should create an object keyed by the result of the getKey function', () => {
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];

    const result = keyBy(users, (user) => user.id);

    expect(result).toEqual({
      1: { id: 1, name: 'Alice' },
      2: { id: 2, name: 'Bob' },
      3: { id: 3, name: 'Charlie' },
    });
  });

  it('should handle string keys', () => {
    const users = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ];

    const result = keyBy(users, (user) => user.id);

    expect(result).toEqual({
      a: { id: 'a', name: 'Alice' },
      b: { id: 'b', name: 'Bob' },
    });
  });

  it('should handle empty arrays', () => {
    const result = keyBy([], () => 'key');

    expect(result).toEqual({});
  });

  it('should use the index when provided', () => {
    const items = ['a', 'b', 'c'];

    const result = keyBy(items, (_, idx) => idx);

    expect(result).toEqual({
      0: 'a',
      1: 'b',
      2: 'c',
    });
  });

  it('should overwrite duplicate keys with the last value', () => {
    const users = [
      { id: 1, name: 'Alice' },
      { id: 1, name: 'Bob' },
    ];

    const result = keyBy(users, (user) => user.id);

    expect(result).toEqual({
      1: { id: 1, name: 'Bob' },
    });
  });
});

describe('mapValues', () => {
  it('should transform all values in an object', () => {
    const obj = { a: 1, b: 2, c: 3 };

    const result = mapValues(obj, (value) => value * 2);

    expect(result).toEqual({ a: 2, b: 4, c: 6 });
  });

  it('should provide the key to the transform function', () => {
    const obj = { a: 1, b: 2 };

    const result = mapValues(obj, (value, key) => `${key}-${value}`);

    expect(result).toEqual({ a: 'a-1', b: 'b-2' });
  });

  it('should handle empty objects', () => {
    const result = mapValues({}, (value) => value);

    expect(result).toEqual({});
  });

  it('should work with objects containing different value types', () => {
    const obj = { a: 'hello', b: 'world' };

    const result = mapValues(obj, (value) => value.toUpperCase());

    expect(result).toEqual({ a: 'HELLO', b: 'WORLD' });
  });
});
