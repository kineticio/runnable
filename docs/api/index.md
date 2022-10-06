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

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string; type?: 'text' | 'password' | 'email'; validation?: (value: string) => ValidationResponse; }): FormPromise<string>;`

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

- **Type:** `(opts: { label: string; helperText?: string; placeholder?: string; validation?: (value: number) => ValidationResponse; }): FormPromise<string>;`

  Send a number input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const age = await io.input.text({
      label: 'Enter your age',
    });
  };
  ```
