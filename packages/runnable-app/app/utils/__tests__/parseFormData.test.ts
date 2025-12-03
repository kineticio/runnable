import { describe, it, expect } from 'vitest';
import { parseFormData } from '../parseFormData';

describe('parseFormData', () => {
  it('should parse form data', () => {
    const formData = new FormData();
    formData.append('foo', 'bar');
    formData.append('baz[0]', 'qux');
    formData.append('baz[1]', 'quux');
    formData.append('baz[2]', 'corge');

    expect(parseFormData(formData)).toEqual({
      foo: 'bar',
      baz: ['qux', 'quux', 'corge'],
    });
  });

  it('should parse duplicate form data', () => {
    const formData = new FormData();
    formData.append('foo', 'bar');
    formData.append('foo', 'baz');
    formData.append('foo', 'qux');

    expect(parseFormData(formData)).toEqual({
      foo: ['bar', 'baz', 'qux'],
    });
  });
});
