import { TableCellValue } from '@runnablejs/api';
import { Input } from '../models/workflows/InputBuilder';
import type { Validator } from './validator';

export type InputForm<T extends object> = {
  [P in keyof T]: FormPromise<T[P]>;
};

export interface FormFieldOptions<T> {
  label: string;
  helperText?: string;
  placeholder?: string;
  optional?: boolean;
  defaultValue?: T;
  validation?: Validator<T>;
}

export interface FormPromise<T> extends Promise<T> {
  payload: Input<T>;
  cancel: () => void;
}

interface MultiSelectOptions<T> extends FormFieldOptions<T[]> {
  initialSelection?: string[];
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}

interface SelectOptions<T> extends FormFieldOptions<T> {
  initialSelection?: string;
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}

interface TextOptions extends FormFieldOptions<string> {
  type?: 'text' | 'password' | 'email';
}

interface NumberOptions extends FormFieldOptions<number> {}

interface BooleanOptions extends FormFieldOptions<boolean> {}

interface ColorOptions extends FormFieldOptions<string> {}

interface ImageOptions extends FormFieldOptions<string> {}

interface TableOptions<T> extends FormFieldOptions<T> {
  data: T[];
  headers: string[];
  initialSelection?: string;
  getValue: (item: T) => string;
  getColumns: (item: T) => TableCellValue[];
}

interface MultiTableOptions<T> extends FormFieldOptions<T[]> {
  data: T[];
  headers: string[];
  initialSelection?: string[];
  getValue: (item: T) => string;
  getColumns: (item: T) => TableCellValue[];
}

interface CombinedForm {
  <A, B>(a: FormPromise<A>, b: FormPromise<B>): FormPromise<[A, B]>;
  <A, B, C>(a: FormPromise<A>, b: FormPromise<B>, c: FormPromise<C>): FormPromise<[A, B, C]>;
  <A, B, C, D>(a: FormPromise<A>, b: FormPromise<B>, c: FormPromise<C>, d: FormPromise<D>): FormPromise<[A, B, C, D]>;
}

/**
 * Input/Output for an action
 *
 * Promises are sent to the client and resolved when the user submits a response.
 *
 * @example
 * ```
 * const { email } = await io.input.text({
 *  label: 'Email',
 *  description: 'The email address of the user',
 * });
 */
export interface InputOutput {
  form<T extends Record<string, any>>(form: InputForm<T>): FormPromise<T>;
  hstack: CombinedForm;
  vstack: CombinedForm;
  input: {
    text(opts: TextOptions): FormPromise<string>;
    number(opts: NumberOptions): FormPromise<number>;
    boolean(opts: BooleanOptions): FormPromise<boolean>;
    color(opts: ColorOptions): FormPromise<string>;
    imageURL(opts: ImageOptions): FormPromise<string>;
  };
  select: {
    radio<T>(opts: SelectOptions<T>): FormPromise<T>;
    dropdown<T>(opts: SelectOptions<T>): FormPromise<T>;
    table<T>(opts: TableOptions<T>): FormPromise<T>;
  };
  multiSelect: {
    checkbox<T>(opts: MultiSelectOptions<T>): FormPromise<T[]>;
    dropdown<T>(opts: MultiSelectOptions<T>): FormPromise<T[]>;
    table<T>(opts: MultiTableOptions<T>): FormPromise<T[]>;
  };
  message: {
    html(opts: { dangerouslySetInnerHTML: string }): void;
    info(opts: { title: string; message: string }): FormPromise<void>;
    table(opts: { title: string; headers: string[]; rows: TableCellValue[][] }): FormPromise<void>;
    success(opts: { title: string; message: string }): FormPromise<void>;
    warning(opts: { title: string; message: string }): FormPromise<void>;
    error(opts: { title: string; message: string }): FormPromise<void>;
  };
}
