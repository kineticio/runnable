import { Validator } from './validator';

export type Primitive = string | number | boolean | null | undefined;

export type InputForm<T extends object> = {
  [P in keyof T]: FormPromise<T[P]>;
};

export interface FormPromise<T> extends Promise<T> {
  payload: any;
  cancel: () => void;
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
  input: {
    text(opts: {
      label: string;
      helperText?: string;
      placeholder?: string;
      defaultValue?: boolean;
      type?: 'text' | 'password' | 'email';
      validation?: Validator<string>;
    }): FormPromise<string>;
    number(opts: {
      label: string;
      helperText?: string;
      placeholder?: string;
      defaultValue?: number;
      validation?: Validator<number>;
    }): FormPromise<number>;
    boolean(opts: { label: string; helperText?: string; defaultValue?: boolean }): FormPromise<boolean>;
    color(opts: { label: string; helperText?: string; defaultValue?: string }): FormPromise<string>;
    imageURL(opts: { label: string; helperText?: string; defaultValue?: string }): FormPromise<string>;
  };
  select: {
    radio<T>(opts: {
      label: string;
      helperText?: string;
      validation?: Validator<T>;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T>;
    dropdown<T>(opts: {
      label: string;
      helperText?: string;
      validation?: Validator<T>;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T>;
    table<T>(opts: {
      label: string;
      helperText?: string;
      validation?: Validator<T>;
      data: T[];
      headers: string[];
      initialSelection?: string;
      getValue: (item: T) => string;
      getColumns: (item: T) => string[];
    }): FormPromise<T>;
  };
  multiSelect: {
    checkbox<T>(opts: {
      label: string;
      helperText?: string;
      validation?: Validator<T[]>;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T[]>;
    dropdown<T>(opts: {
      label: string;
      helperText?: string;
      validation?: Validator<T[]>;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T[]>;
    table<T>(opts: {
      label: string;
      helperText?: string;
      validation?: Validator<T[]>;
      data: T[];
      headers: string[];
      initialSelection?: string[];
      getValue: (item: T) => string;
      getColumns: (item: T) => string[];
    }): FormPromise<T[]>;
  };
  message: {
    html(opts: { dangerouslySetInnerHTML: string }): void;
    info(opts: { title: string; description: string }): Promise<void>;
    table(opts: { title: string; headers: string[]; rows: Primitive[][] }): Promise<void>;
    success(opts: { title: string; description: string }): Promise<void>;
  };
}
