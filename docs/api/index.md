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

## Basic inputs

- **Type:** `InputOutput`

  `io` is a fluid API for interacting with the client/frontend/user.

  ```ts
  const execute = (io: InputOutput) => {
    // ...
  };
  ```

### io.input.text

- **Type:** `text(opts: TextOptions): FormPromise<string>;`

  Send a text input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const email = await io.input.text({
      label: "Enter an email",
      helperText: "This must be unique.",
      placeholder: "michael@dundermifflin.com",
      type: "text",
      validation: (email) => {
        if (!email.includes("@")) {
          return "Must be a valid email.";
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
  defaultValue?: string;
  optional?: boolean;
  type?: "text" | "password" | "email";
  validation?: Validator<string>;
}
```

### io.input.number

- **Type:** `number(opts: NumberOptions): FormPromise<number>;`

  Send a number input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const age = await io.input.text({
      label: "Enter your age",
    });
  };
  ```

#### NumberOptions

```ts
interface NumberOptions {
  label: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: number;
  validation?: Validator<number>;
}
```

### io.input.boolean

- **Type:** `boolean(opts: BooleanOptions): FormPromise<boolean>;`

  Send a boolean input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const shouldSendEmail = await io.input.boolean({
      label: "Should the user receive an email notification of the change?",
    });
  };
  ```

#### BooleanOptions

```ts
interface BooleanOptions {
  label: string;
  helperText?: string;
  defaultValue?: boolean;
}
```

### io.input.color

- **Type:** `color(opts: ColorOptions): FormPromise<string>;`

  Send a color input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const color = await io.input.color({
      label: "Select a color",
    });
  };
  ```

#### ColorOptions

```ts
interface ColorOptions {
  label: string;
  helperText?: string;
  defaultValue?: string;
}
```

### io.input.imageURL

- **Type:** `imageURL(opts: ImageOptions): FormPromise<string>;`

  Send an image URL input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const imageURL = await io.input.imageURL({
      label: "Enter an image URL",
    });
  };
  ```

#### ImageOptions

```ts
interface ImageOptions {
  label: string;
  helperText?: string;
  defaultValue?: string;
}
```

### io.select.radio / io.select.dropdown

- **Type:** `radio<T>(opts: SelectOptions<T>): FormPromise<T>;`

  Send a select input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const color = await io.select.radio({
      label: "Select a color",
      data: ["red", "green", "blue"],
      getLabel: (color) => color.toUpperCase(),
      getValue: (color) => color,
    });

    const format = await io.select.dropdown({
      label: "Select a format",
      data: ["json", "yaml", "toml"],
      getLabel: (format) => format.toUpperCase(),
      getValue: (format) => format,
    });
  };
  ```

```ts
interface SelectOptions<T> {
  label: string;
  helperText?: string;
  initialSelection?: string;
  validation?: Validator<T>;
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}
```

### io.select.table

- **Type:** `table<T>(opts: TableOptions<T>): FormPromise<T>;`

  Send a table input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const team = await io.input.table({
      label: "Select a team",
      data: ["HR", "Sales", "Marketing"],
      getValue: (team) => team,
      getColumns: (team) => [team],
    });
  };
  ```

#### TableOptions

```ts
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
```

### io.multiSelect.checkbox / io.multiSelect.dropdown

- **Type:** `checkbox<T>(opts: MultiSelectOptions<T>): FormPromise<T[]>;`

  Send a multi-select input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const colors = await io.multiSelect.checkbox({
      label: "Select colors",
      data: ["red", "green", "blue"],
      getLabel: (color) => color.toUpperCase(),
      getValue: (color) => color,
    });

    const format = await io.multiSelect.dropdown({
      label: "Select a format",
      data: ["json", "yaml", "toml"],
      getLabel: (format) => format.toUpperCase(),
      getValue: (format) => format,
    });
  };
  ```

#### MultiSelectOptions

```ts
interface MultiSelectOptions<T> {
  label: string;
  helperText?: string;
  initialSelection?: string[];
  validation?: Validator<T[]>;
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
}
```

### io.multiSelect.table

- **Type:** `table<T>(opts: MultiTableOptions<T>): FormPromise<T[]>`

  Send a multi-select table input to the client, and wait for a response.

  ```ts
  const execute = (io: InputOutput) => {
    const teams = await io.multiSelect.table({
      label: "Select teams",
      data: ["HR", "Sales", "Marketing"],
      getValue: (team) => team,
      getColumns: (team) => [team],
    });
  };
  ```

#### MultiSelectTableOptions

```ts
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
```

## Messages

### io.message.html

- **Type:** `(opts: { dangerouslySetInnerHTML: string; }): void`

  Send an HTML message to the client.

  ```ts
  const execute = (io: InputOutput) => {
    io.message.html({
      dangerouslySetInnerHTML: "<h1>Hello World</h1>",
    });
  };
  ```

### io.message.success / io.message.warning / io.message.error

- **Type:** `(opts: { message: string; message: string }): void`

  Send a message to the client.

  ```ts
  const execute = (io: InputOutput) => {
    io.message.info({
      title: "Hello World",
      message: "This is a description",
    });
  };
  ```

## Advanced Inputs

### io.message.table

- **Type:** `table(opts: { title: string; headers: string[]; rows: TableCellValue[][] }): FormPromise<void>;`

  Send a read-only table to the client.

  ```ts
  const execute = (io: InputOutput) => {
    io.message.table({
      title: "Users",
      headers: ["Name", "Age"],
      rows: [
        ["John", 30],
        ["Jane", 25],
      ],
    });
  };
  ```

### io.form

Create a composite form with multiple inputs.

```ts
const execute = (io: InputOutput) => {
  const { name, email } = await io.form({
    name: io.input.text({
      label: 'Name',
      helperText: 'Enter the name of the user',
    }),
    email: io.input.text({
      label: 'Email',
      helperText: 'Enter the email of the user',
      type: 'email',
    }),
  });
```

### io.hstack / io.vstack

Create a horizontal or vertical stack of inputs.

```ts
const execute = (io: InputOutput) => {
  const [, [newUser]] = await io.hstack(
    io.message.table({
      label: "Existing Users",
      headers: ["Name", "Email"],
      rows: users,
    }),
    io.vstack(
      io.form({
        name: io.input.text({
          label: "Name",
          helperText: "Enter the name of the user",
        }),
        email: io.input.text({
          label: "Email",
          helperText: "Enter the email of the user",
          type: "email",
        }),
      }),
      io.message.warning({
        description: "Some message about creating users.",
      })
    )
  );
};
```
