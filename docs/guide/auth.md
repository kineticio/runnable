---
title: Authentication | Guide
---

# Authentication

**Runnable** make it easy to authenticate users with your application. It hooks into your existing authentication system, and provides a simple API for asking for credentials.

## Cookies

Runnable uses cookies to save the user's session. This means you need to provide a secret key to sign the cookies with. You can do this by setting the `RUNNABLE_SECRET` environment variable.

## Example

```ts
import { authService, getUser } from './auth';

installRunnable(app, actions, {
  auth: {
    /**
     * This function is called when the user logs in.
     */
    verifyLogin: (opts) =>
      authService.verifyLogin({
        email: opts.email,
        password: opts.password,
      }),
    /**
     * This function is called on each `execute` call to get the user.
     * This user is passed to the `Action` as the `context.user`.
     */
    getUserById: ({ id }) => getUser({ where: { id } }),
  },
});
```
