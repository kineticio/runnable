import { describe, it, expect } from 'vitest';
import { createInput, createMessage, InputBuilder } from '../InputBuilder';
import type { WorkflowPrompt, Breadcrumb } from '@runnablejs/api';

describe('createInput', () => {
  it('should create an InputBuilder instance', () => {
    const prompt: WorkflowPrompt = {
      $type: 'form-field',
      label: 'Test Field',
      input: { $type: 'text' },
    };

    const builder = createInput(prompt);

    expect(builder).toBeInstanceOf(InputBuilder);
  });
});

describe('createMessage', () => {
  it('should create a message input that returns empty string', () => {
    const prompt: WorkflowPrompt = {
      $type: 'message',
      title: 'Test Message',
      message: 'This is a test',
      severity: 'info',
    };

    const input = createMessage(prompt);

    expect(input.form).toEqual(prompt);
    expect(input.validator()).toBe(true);
    expect(input.normalize('')).toBe('');
    expect(input.format()).toEqual([]);
  });
});

describe('InputBuilder', () => {
  const mockPrompt: WorkflowPrompt = {
    $type: 'form-field',
    label: 'Test Field',
    input: { $type: 'text' },
  };

  describe('normalizeAsString', () => {
    it('should set string normalization', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder.normalizeAsString().build();

      expect(input.normalize('test')).toBe('test');
    });
  });

  describe('normalizeAsNumber', () => {
    it('should set number normalization', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder.normalizeAsNumber().build();

      expect(input.normalize('42')).toBe(42);
      expect(input.normalize('3.14')).toBe(3.14);
    });
  });

  describe('normalizeAsBoolean', () => {
    it('should set boolean normalization', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder.normalizeAsBoolean().build();

      expect(input.normalize('true')).toBe(true);
      expect(input.normalize('false')).toBe(false);
    });
  });

  describe('normalizeAsArray', () => {
    it('should set array normalization', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder.normalizeAsArray().build();

      expect(input.normalize('single')).toEqual(['single']);
      expect(input.normalize(['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('normalizeAsSingleton', () => {
    it('should set singleton normalization', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder.normalizeAsSingleton().build();

      expect(input.normalize('test')).toBe('test');
      expect(input.normalize(['first', 'second'])).toBe('first');
    });
  });

  describe('thenMap', () => {
    it('should chain transformation after normalization', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder
        .normalizeAsString()
        .thenMap((str) => str.toUpperCase())
        .build();

      expect(input.normalize('hello')).toBe('HELLO');
    });

    it('should allow multiple thenMap calls', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder
        .normalizeAsNumber()
        .thenMap((n) => n * 2)
        .thenMap((n) => n + 1)
        .build();

      expect(input.normalize('5')).toBe(11); // 5 * 2 + 1
    });

    it('should work with complex transformations', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder
        .normalizeAsArray<string>()
        .thenMap((arr) => arr.length)
        .build();

      expect(input.normalize(['a', 'b', 'c'])).toBe(3);
    });
  });

  describe('validate', () => {
    it('should set a custom validator', () => {
      const builder = new InputBuilder(mockPrompt);
      const validator = (value: string) => (value.length > 0 ? true : 'Value is required');
      const input = builder.normalizeAsString().validate(validator).build();

      expect(input.validator('test')).toBe(true);
      expect(input.validator('')).toBe('Value is required');
    });

    it('should use default validator when undefined is passed', () => {
      const builder = new InputBuilder(mockPrompt);
      const input = builder.normalizeAsString().validate(undefined).build();

      expect(input.validator('anything')).toBe(true);
    });
  });

  describe('formatBreadcrumbs', () => {
    it('should set breadcrumb formatting function', () => {
      const builder = new InputBuilder(mockPrompt);
      const formatter = (value: string): Breadcrumb => ({
        key: 'test',
        value: value,
      });
      const input = builder.normalizeAsString().formatBreadcrumbs(formatter).build();

      expect(input.format('hello')).toEqual({ key: 'test', value: 'hello' });
    });

    it('should allow returning array of breadcrumbs', () => {
      const builder = new InputBuilder(mockPrompt);
      const formatter = (value: string): Breadcrumb[] => [
        { key: 'first', value: value },
        { key: 'second', value: value.toUpperCase() },
      ];
      const input = builder.normalizeAsString().formatBreadcrumbs(formatter).build();

      expect(input.format('test')).toEqual([
        { key: 'first', value: 'test' },
        { key: 'second', value: 'TEST' },
      ]);
    });
  });

  describe('build', () => {
    it('should build a complete input with all properties', () => {
      const builder = new InputBuilder(mockPrompt);
      const validator = (value: string) => (value.length > 0 ? true : 'Required');
      const formatter = (value: string): Breadcrumb => ({ key: 'value', value });

      const input = builder
        .normalizeAsString()
        .validate(validator)
        .formatBreadcrumbs(formatter)
        .build();

      expect(input.form).toEqual(mockPrompt);
      expect(input.normalize('test')).toBe('test');
      expect(input.validator('test')).toBe(true);
      expect(input.validator('')).toBe('Required');
      expect(input.format('test')).toEqual({ key: 'value', value: 'test' });
    });
  });

  describe('method chaining', () => {
    it('should support fluent interface', () => {
      const builder = new InputBuilder(mockPrompt);
      const validator = (value: number) => (value > 0 ? true : 'Must be positive');
      const formatter = (value: number): Breadcrumb => ({ key: 'count', value });

      const input = builder
        .normalizeAsNumber()
        .validate(validator)
        .formatBreadcrumbs(formatter)
        .thenMap((n) => n * 10)
        .build();

      expect(input.normalize('5')).toBe(50);
      expect(input.validator(50)).toBe(true);
      expect(input.format(50)).toEqual({ key: 'count', value: 50 });
    });
  });
});
