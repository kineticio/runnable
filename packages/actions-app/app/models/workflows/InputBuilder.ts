import { Validator } from '../../api/actions';
import { IOForm } from '../../types/response';
import { BreadCrumb } from './bread-crumbs.server';
import {
  Normalizer,
  normalizeAsString,
  normalizeAsNumber,
  normalizeAsArray,
  normalizeAsSingleton,
} from './normalizers.server';

export function createInput(payload: IOForm) {
  return new InputBuilder<unknown>(payload);
}

export interface Input<T> {
  form: IOForm<T>;
  normalize: Normalizer<T>;
  validator: Validator<T>;
  format: (value: T) => BreadCrumb[] | BreadCrumb;
}

export class InputBuilder<T> {
  private normalize!: Normalizer<any>;
  private validator: Validator<any> = () => true;
  private format!: (value: T) => BreadCrumb[] | BreadCrumb;

  constructor(private form: IOForm<T>) {}

  public normalizeAsString(): InputBuilder<string> {
    this.normalize = normalizeAsString as any;
    return this as any;
  }

  public normalizeAsNumber(): InputBuilder<number> {
    this.normalize = normalizeAsNumber as any;
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

  public formatBreadcrumbs(format: (value: T) => BreadCrumb[] | BreadCrumb): InputBuilder<T> {
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
