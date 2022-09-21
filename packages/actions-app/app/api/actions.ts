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

export interface InputOutput {
  input: {
    text(opts: {
      label: string;
      helperText?: string;
      placeholder?: string;
      type?: 'text' | 'password' | 'email';
      validation?: (value: string) => ValidationResponse;
    }): Promise<string>;
    number(opts: {
      label: string;
      helperText?: string;
      validation?: (value: number) => ValidationResponse;
    }): Promise<number>;
  };
  select: {
    radio<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): Promise<T>;
    dropdown<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): Promise<T>;
    // table<T extends Record<string, any>>(opts: {
    //   label: string;
    //   helperText?: string;
    //   validation?: (value: string) => ValidationResponse;
    //   data: T[];
    // }): Promise<T>;
  };
  multiSelect: {
    checkbox<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): Promise<T[]>;
    dropdown<T>(opts: {
      label: string;
      helperText?: string;
      validation?: (value: string) => ValidationResponse;
      data: T[];
      getLabel: (item: T) => string;
      getValue: (item: T) => string;
    }): Promise<T[]>;
    // table<T extends Record<string, any>>(opts: {
    //   label: string;
    //   helperText?: string;
    //   validation?: (value: string) => ValidationResponse;
    //   data: T[];
    // }): Promise<T[]>;
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
