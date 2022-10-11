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

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string; type?: 'text' | 'password' | 'email'; validation?: Validator<string>; }): FormPromise<string>;`

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
