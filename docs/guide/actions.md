---
title: Actions | Guide
---

# Actions

**Actions** are the building blocks of Runnable. Each action is meant to perform a single task which can be executed by the user. Actions all contain metadata which is used to display the action in the UI, for example the name, description, category, and icon.

## Example

```ts
// user.actions.ts
const CreateUserAction = (db: DB) => ({
  title: 'Create User',
  icon: 'fa6-solid:user-plus',
  category: 'Users',
  execute: async (io) => {
    // ask for the user's name
    const name = await io.input.text({
      label: 'Name',
    });

    // ask for the user's email
    const email = await io.input.text({
      label: 'Email',
    });

    // create the user
    await db.createUser({ name, email });
  },
});

// main.ts

installRunnable(
  app,
  {
    create_user: CreateUserAction(db),
  },
  { auth: auth }
);
```
