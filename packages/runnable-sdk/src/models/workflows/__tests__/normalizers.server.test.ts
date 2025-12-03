import { describe, it, expect } from 'vitest';
import {
  normalizeAsString,
  normalizeAsBoolean,
  normalizeAsNumber,
  normalizeAsArray,
  normalizeAsSingleton,
} from '../normalizers.server';
import { ValidationError } from '../../errors';

describe('normalizeAsString', () => {
  it('should return string values as-is', () => {
    expect(normalizeAsString('hello')).toBe('hello');
    expect(normalizeAsString('world')).toBe('world');
  });

  it('should extract first element from string array', () => {
    expect(normalizeAsString(['first', 'second'])).toBe('first');
  });

  it('should throw ValidationError for null', () => {
    expect(() => normalizeAsString(null)).toThrow(ValidationError);
  });

  it('should throw ValidationError for undefined', () => {
    expect(() => normalizeAsString(undefined)).toThrow(ValidationError);
  });

  it('should handle single-element arrays', () => {
    expect(normalizeAsString(['only'])).toBe('only');
  });

  it('should throw ValidationError for empty arrays', () => {
    expect(() => normalizeAsString([])).toThrow(ValidationError);
  });
});

describe('normalizeAsBoolean', () => {
  it('should return boolean values as-is', () => {
    // @ts-expect-error TS is aware of the type, but we want to test runtime behavior
    expect(normalizeAsBoolean(true)).toBe(true);
    // @ts-expect-error TS is aware of the type, but we want to test runtime behavior
    expect(normalizeAsBoolean(false)).toBe(false);
  });

  it('should return false for null', () => {
    expect(normalizeAsBoolean(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(normalizeAsBoolean(undefined)).toBe(false);
  });

  it('should convert "true" string to true', () => {
    expect(normalizeAsBoolean('true')).toBe(true);
  });

  it('should convert "false" string to false', () => {
    expect(normalizeAsBoolean('false')).toBe(false);
  });

  it('should convert empty string to true', () => {
    expect(normalizeAsBoolean('')).toBe(true);
  });

  it('should convert ["true"] to true', () => {
    expect(normalizeAsBoolean(['true'])).toBe(true);
  });

  it('should convert ["false"] to false', () => {
    expect(normalizeAsBoolean(['false'])).toBe(false);
  });

  it('should throw ValidationError for invalid string values', () => {
    expect(() => normalizeAsBoolean('invalid')).toThrow(ValidationError);
    expect(() => normalizeAsBoolean('yes')).toThrow(ValidationError);
  });
});

describe('normalizeAsNumber', () => {
  it('should convert numeric strings to numbers', () => {
    expect(normalizeAsNumber('42')).toBe(42);
    expect(normalizeAsNumber('0')).toBe(0);
    expect(normalizeAsNumber('-10')).toBe(-10);
  });

  it('should handle decimal numbers', () => {
    expect(normalizeAsNumber('3.14')).toBe(3.14);
    expect(normalizeAsNumber('0.5')).toBe(0.5);
  });

  it('should convert string arrays to numbers', () => {
    expect(normalizeAsNumber(['42'])).toBe(42);
  });

  it('should throw ValidationError for non-numeric strings', () => {
    expect(() => normalizeAsNumber('not a number')).toThrow(ValidationError);
    expect(() => normalizeAsNumber('abc')).toThrow(ValidationError);
  });

  it('should convert empty strings to 0', () => {
    expect(normalizeAsNumber('')).toBe(0);
  });

  it('should handle null and undefined as empty string which throws', () => {
    expect(() => normalizeAsNumber(null)).toThrow(ValidationError);
    expect(() => normalizeAsNumber(undefined)).toThrow(ValidationError);
  });
});

describe('normalizeAsArray', () => {
  it('should return arrays as-is', () => {
    const arr = ['a', 'b', 'c'];
    expect(normalizeAsArray(arr)).toEqual(arr);
  });

  it('should wrap non-array values in an array', () => {
    expect(normalizeAsArray('single')).toEqual(['single']);
  });

  it('should return empty array for null', () => {
    expect(normalizeAsArray(null)).toEqual([]);
  });

  it('should return empty array for undefined', () => {
    expect(normalizeAsArray(undefined)).toEqual([]);
  });

  it('should handle empty arrays', () => {
    expect(normalizeAsArray([])).toEqual([]);
  });

  it('should work with different types', () => {
    // @ts-expect-error TS is aware of the type, but we want to test runtime behavior
    expect(normalizeAsArray(123)).toEqual([123]);
    // @ts-expect-error TS is aware of the type, but we want to test runtime behavior
    expect(normalizeAsArray({ key: 'value' })).toEqual([{ key: 'value' }]);
  });
});

describe('normalizeAsSingleton', () => {
  it('should return the value if it is not an array', () => {
    expect(normalizeAsSingleton('single')).toBe('single');
    expect(normalizeAsSingleton(123)).toBe(123);
  });

  it('should extract first element from array', () => {
    expect(normalizeAsSingleton(['first', 'second'])).toBe('first');
  });

  it('should throw ValidationError for null', () => {
    expect(() => normalizeAsSingleton(null)).toThrow(ValidationError);
  });

  it('should throw ValidationError for undefined', () => {
    expect(() => normalizeAsSingleton(undefined)).toThrow(ValidationError);
  });

  it('should throw ValidationError for empty arrays', () => {
    expect(() => normalizeAsSingleton([])).toThrow(ValidationError);
  });

  it('should handle single-element arrays', () => {
    expect(normalizeAsSingleton(['only'])).toBe('only');
  });

  it('should return first element even if array has multiple values', () => {
    expect(normalizeAsSingleton(['a', 'b', 'c'])).toBe('a');
  });
});
