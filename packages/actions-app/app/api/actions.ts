export interface Actions {
  [key: string]: Action;
}

export interface Action {
  title: string;
  description?: string;
  icon?: string;
  execute: (io: InputOutput, context: ActionContext) => Promise<void>;
}

export type ValidationResponse = string | true;

export type InputForm<T extends object> = {
  [P in keyof T]: FormPromise<T[P]>;
};

export interface FormPromise<T> {
  payload: any;
  prompt: () => Promise<T>;
}

export interface InputOutput {
  form<T extends Record<string, any>>(form: InputForm<T>): FormPromise<T>;
  input: {
    text(opts: {
      label: string;
      helperText?: string;
      placeholder?: string;
      type?: 'text' | 'password' | 'email';
      validation?: (value: string) => ValidationResponse;
    }): FormPromise<string>;
    number(opts: {
      label: string;
      helperText?: string;
      validation?: (value: number) => ValidationResponse;
    }): FormPromise<number>;
  };
  select: {
    radio<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T>;
    dropdown<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T>;
    table<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
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
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T[]>;
    dropdown<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): FormPromise<T[]>;
    table<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      headers: string[];
      initialSelection?: string[];
      getValue: (item: T) => string;
      getColumns: (item: T) => string[];
    }): FormPromise<T[]>;
  };
}

export interface ActionContext {
  loading: {
    start(opts: { label: string; length: number }): void;
    completeOne(): void;
    complete(number: string): void;
  };
  message: {
    info(opts: { message: string }): Promise<void>;
    success(opts: { message: string }): Promise<void>;
  };
}
