import { Breadcrumb, WorkflowPrompt } from '@runnablejs/api';
import { Validator } from '../../api/validator';
import {
  Normalizer,
  normalizeAsString,
  normalizeAsNumber,
  normalizeAsArray,
  normalizeAsSingleton,
  normalizeAsBoolean,
} from './normalizers.server';

export function createInput(payload: WorkflowPrompt): InputBuilder<unknown> {
  return new InputBuilder<unknown>(payload);
}

export function createMessage(payload: WorkflowPrompt): Input<void> {
  return {
    form: payload,
    validator: () => true,
    normalize: () => {
      return '' as never;
    },
    format: () => [],
  };
}

export interface Input<T> {
  form: WorkflowPrompt;
  normalize: Normalizer<T>;
  validator: Validator<T>;
  format: (value: T) => Breadcrumb[] | Breadcrumb;
}

export class InputBuilder<T> {
  private normalize!: Normalizer<any>;
  private validator: Validator<any> = () => true;
  private format!: (value: T) => Breadcrumb[] | Breadcrumb;

  constructor(private form: WorkflowPrompt) {}

  public normalizeAsString(): InputBuilder<string> {
    this.normalize = normalizeAsString as any;
    return this as any;
  }

  public normalizeAsNumber(): InputBuilder<number> {
    this.normalize = normalizeAsNumber as any;
    return this as any;
  }

  public normalizeAsBoolean(): InputBuilder<boolean> {
    this.normalize = normalizeAsBoolean as any;
    return this as any;
  }

  public normalizeAsArray<U>(): InputBuilder<U[]> {
    this.normalize = normalizeAsArray as any;
    return this as any;
  }

  public normalizeAsSingleton<U>(): InputBuilder<U> {
    this.normalize = normalizeAsSingleton as any;
    return this as any;
  }

  public thenMap<U>(mapper: (value: T) => U): InputBuilder<U> {
    const normalize = this.normalize;
    this.normalize = (value) => mapper(normalize(value));
    return this as any;
  }

  public validate(validator: Validator<T> | undefined): InputBuilder<T> {
    if (validator) {
      this.validator = validator;
    }
    return this as any;
  }

  public formatBreadcrumbs(format: (value: T) => Breadcrumb[] | Breadcrumb): InputBuilder<T> {
    this.format = format;
    return this as any;
  }

  public build(): Input<T> {
    return {
      form: this.form,
      normalize: this.normalize,
      validator: this.validator,
      format: this.format,
    };
  }
}
