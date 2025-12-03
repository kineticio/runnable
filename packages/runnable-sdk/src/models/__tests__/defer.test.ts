import { describe, it, expect } from 'vitest';
import { defer } from '../defer';

describe('defer', () => {
  it('should create a deferred promise that can be resolved', async () => {
    const deferred = defer<string>();

    const resultPromise = deferred.promise.then((value) => {
      expect(value).toBe('test value');
      return value;
    });

    deferred.resolve('test value');

    await expect(resultPromise).resolves.toBe('test value');
  });

  it('should create a deferred promise that can be rejected', async () => {
    const deferred = defer<string>();

    const resultPromise = deferred.promise.catch((error) => {
      expect(error).toBe('test error');
      throw error;
    });

    deferred.reject('test error');

    await expect(resultPromise).rejects.toBe('test error');
  });

  it('should handle resolving with numbers', async () => {
    const deferred = defer<number>();

    deferred.resolve(42);

    await expect(deferred.promise).resolves.toBe(42);
  });

  it('should handle resolving with objects', async () => {
    const deferred = defer<{ name: string; age: number }>();

    const result = { name: 'Alice', age: 30 };
    deferred.resolve(result);

    await expect(deferred.promise).resolves.toEqual(result);
  });

  it('should handle resolving with another promise', async () => {
    const deferred = defer<string>();

    const innerPromise = Promise.resolve('resolved value');
    deferred.resolve(innerPromise);

    await expect(deferred.promise).resolves.toBe('resolved value');
  });

  it('should allow multiple then handlers on the same promise', async () => {
    const deferred = defer<string>();

    const results: string[] = [];

    deferred.promise.then((value) => results.push(`first: ${value}`));
    deferred.promise.then((value) => results.push(`second: ${value}`));

    deferred.resolve('test');

    // Wait for all handlers to complete
    await deferred.promise;

    expect(results).toEqual(['first: test', 'second: test']);
  });

  it('should handle rejection with error objects', async () => {
    const deferred = defer<string>();

    const error = new Error('Something went wrong');
    deferred.reject(error);

    await expect(deferred.promise).rejects.toThrow('Something went wrong');
  });
});
