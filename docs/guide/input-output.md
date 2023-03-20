---
title: Input/Output | Guide
---

# Input/Output

The `io` object is passed to every runnable's `execute` function. It provides a set of methods for interacting with the user.

When asking a user for input, you block the execution while waiting for a `Promise` to resolve. The promise is resolved once the user fills out the response in the admin portal UI.

This means that you can use `async/await` syntax to make your code more readable, use conditional logic, `try/catch`, handle validation, and use `while` or `for` loops.

## Example

This will display all transactions in a list, and ask the user to select one.

```ts
const execute = (io: InputOutput) => {
  const transactions = await getTransactions();

  const transaction = await io.select.table({
    label: 'Select a transaction',
    data: transactions,
    getValue: (transaction) => transaction.id,
    getColumns: (transaction) => [transaction.name],
  });

  // ... do something with the selected transaction
};
```

## Intuitive control flow

I/O methods are designed to be used sequentially. This means that you can ask another question based on the answer to the previous question.

```ts
const execute = (io: InputOutput) => {
  // get all companies
  const companies = await getCompanies();
  const company = await io.select.table({
    label: 'Select a company',
    data: companies,
    getValue: (company) => company.id,
    getColumns: (company) => [company.name],
  });

  // get all transactions for the selected company
  const transactionForCompany = await getTransactions({
    companyId: company.id,
  });

  // ask for a transaction, and validate it can be modified
  while (true) {
    const transaction = await io.select.table({
      label: 'Select a transaction',
      data: transactionForCompany,
      getValue: (transaction) => transaction.id,
      getColumns: (transaction) => [transaction.name],
    });

    if (canModify(transaction)) {
      break;
    }

    await io.message.warning({
      title: 'Error',
      message: 'You cannot modify this transaction. Select a new one',
    });
  }

  // ... do something with the selected transaction
};
```

## Combining I/O methods

You can combine I/O methods to create composite forms.

```ts
const execute = (io: InputOutput) => {
  const { name, email } = await io.form({
    name: io.input.text({
      label: 'Name',
      validation: (value) => {
        return value.length < 3 ? 'Name must be at least 3 characters' : true;
      },
    }),
    email: io.input.text({
      label: 'Email',
      type: 'email',
      validation: (value) => {
        return !value.includes('2') ? 'Must be a valid email' : true;
      },
    }),
  });

  // ... create user
};
```

## Creating simple views with stacks

You can also arrange UI in vertical and horizontal stacks to add a bit of layout or hierarchy.

```ts
const [[firstName, lastName], subscribe] = await io.hstack(
  io.vstack(
    io.input.text({
      label: 'First name',
    }),
    io.input.text({
      label: 'Last name',
    })
  ),
  io.input.boolean({ label: 'Subscribe' })
);
```
