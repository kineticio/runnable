import type { Validator } from './validator';

export type TableCellValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { type: 'link'; href: string; text: string }
  | { type: 'date'; date: Date }
  | { type: 'image'; src: string; alt: string }
  | Date;

export type InputForm<T extends object> = {
  [P in keyof T]: FormPromise<T[P]>;
};

export interface FormPromise<T> extends Promise<T> {
  payload: any;
  cancel: () => void;
}

interface MultiSelectOptions<T> {
  label: string;
  helperText?: string;
  initialSelection?: string[];
  validation?: Validator<T[]>;
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}

interface SelectOptions<T> {
  label: string;
  helperText?: string;
  initialSelection?: string;
  validation?: Validator<T>;
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}

interface TextOptions {
  label: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: boolean;
  optional?: boolean;
  type?: 'text' | 'password' | 'email';
  validation?: Validator<string>;
}

interface NumberOptions {
  label: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: number;
  validation?: Validator<number>;
}

interface BooleanOptions {
  label: string;
  helperText?: string;
  defaultValue?: boolean;
}

interface ColorOptions {
  label: string;
  helperText?: string;
  defaultValue?: string;
}

interface ImageOptions {
  label: string;
  helperText?: string;
  defaultValue?: string;
}

interface TableOptions<T> {
  label: string;
  helperText?: string;
  validation?: Validator<T>;
  data: T[];
  headers: string[];
  initialSelection?: string;
  getValue: (item: T) => string;
  getColumns: (item: T) => TableCellValue[];
}

interface MultiTableOptions<T> {
  label: string;
  helperText?: string;
  validation?: Validator<T[]>;
  data: T[];
  headers: string[];
  initialSelection?: string[];
  getValue: (item: T) => string;
  getColumns: (item: T) => TableCellValue[];
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
    info(opts: { title: string; description: string }): Promise<void>;
    table(opts: { title: string; headers: string[]; rows: TableCellValue[][] }): Promise<void>;
    success(opts: { title: string; description: string }): Promise<void>;
    warning(opts: { title: string; description: string }): Promise<void>;
    error(opts: { title: string; description: string }): Promise<void>;
  };
}
