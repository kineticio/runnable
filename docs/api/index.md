---
outline: deep
---

# API Reference

This section contains the API reference the parameters passed to each actions

```ts
export interface Action {
  title: string;
  description?: string;
  icon?: string;
  execute: (io: InputOutput) => Promise<void>;
}
```

## io

- **Type:** `InputOutput`

  `io` is a fluid API for interacting with the client/frontend/user.

  ```ts
  const execute = (io: InputOutput) => {
    // ...
  };
  ```

### io.input.text

- **Type:** `(opts: TextOptions): FormPromise<string>;`

  Send a text input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const email = await io.input.text({
      label: 'Enter an email',
      helperText: 'This must be unique.',
      placeholder: 'michael@dundermifflin.com',
      type: 'text',
      validation: (email) => {
        if (!email.includes('@')) {
          return 'Must be a valid email.';
        }
        return true;
      },
    });
  };
  ```

#### TextOptions

```ts
interface TextOptions {
  label: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: boolean;
  optional?: boolean;
  type?: 'text' | 'password' | 'email';
  validation?: Validator<string>;
}
```

### io.input.number

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string; validation?: Validator<number>; }): FormPromise<number>;`

  Send a number input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const age = await io.input.text({
      label: 'Enter your age',
    });
  };
  ```

### io.input.boolean

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string; validation?: Validator<boolean>; }): FormPromise<boolean>;`

  Send a boolean input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const shouldSendEmail = await io.input.boolean({
      label: 'Should the user receive an email notification of the change?',
    });
  };
  ```

### io.input.color

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string }): FormPromise<string>;`

  Send a color input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const color = await io.input.color({
      label: 'Select a color',
    });
  };
  ```

### io.input.imageURL

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string; validation?: Validator<string>; }): FormPromise<string>;`

  Send an image URL input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const imageURL = await io.input.imageURL({
      label: 'Enter an image URL',
    });
  };
  ```

### io.select.radio / io.select.dropdown

- **Type:** `radio<T>(opts: { label: string; helperText?: string; validation?: Validator<T>; data: T[]; getLabel: (item: T) => string; getValue: (item: T) => string; }): FormPromise<T>`

  Send a select input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const color = await io.input.select({
      label: 'Select a color',
      data: ['red', 'green', 'blue'],
      getLabel: (color) => color.toUpperCase(),
      getValue: (color) => color,
    });
  };
  ```

### io.select.table

- **Type:** `table<T>(opts: { label: string; helperText?: string; data: T[]; getValue: (item: T) => string; getColumns: (item: T) => TableCellValue[] }): FormPromise<T>`

  Send a table input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const team = await io.input.table({
      label: 'Select a team',
      data: ['HR', 'Sales', 'Marketing'],
      getValue: (team) => team,
      getColumns: (team) => [team],
    });
  };
  ```

### io.multiSelect.checkbox / io.multiSelect.dropdown

- **Type:** `checkbox<T>(opts: { label: string; helperText?: string; validation?: Validator<T[]>; data: T[]; getLabel: (item: T) => string; getValue: (item: T) => string; }): FormPromise<T[]>`

  Send a multi-select input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const colors = await io.input.multiSelect({
      label: 'Select colors',
      data: ['red', 'green', 'blue'],
      getLabel: (color) => color.toUpperCase(),
      getValue: (color) => color,
    });
  };
  ```

### io.multiSelect.table

- **Type:** `table<T>(opts: { label: string; helperText?: string; data: T[]; getValue: (item: T) => string; getColumns: (item: T) => TableCellValue[] }): FormPromise<T[]>`

  Send a multi-select table input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const teams = await io.input.table({
      label: 'Select teams',
      data: ['HR', 'Sales', 'Marketing'],
      getValue: (team) => team,
      getColumns: (team) => [team],
    });
  };
  ```

### io.message.html

- **Type:** `(opts: { dangerouslySetInnerHTML: string; }): void`

  Send an HTML message to the client.

  ```ts
  const execute = (io: InputOutput) => {
    io.message.html({
      dangerouslySetInnerHTML: '<h1>Hello World</h1>',
    });
  };
  ```

### io.message.info / io.message.success / io.message.warning / io.message.error

- **Type:** `(opts: { message: string; description: string }): void`

  Send a message to the client.

  ```ts
  const execute = (io: InputOutput) => {
    io.message.info({
      title: 'Hello World',
      description: 'This is a description',
    });
  };
  ```

### io.message.table

- **Type:** `(opts: { title: string; description: string; data: TableCellValue[][] }): void`

  Send a read-only table to the client.

  ```ts
  const execute = (io: InputOutput) => {
    io.message.table({
      title: 'Users',
      headers: ['Name', 'Age'],
      rows: [
        ['John', 30],
        ['Jane', 25],
      ],
    });
  };
  ```
