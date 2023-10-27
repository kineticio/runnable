---
title: Authentication | Guide
---

# Authentication

**Runnable** make it easy to authenticate users with your application. It hooks into your existing authentication system, and provides a simple API for asking for credentials. It also includes a few out-of-the-box providers, such as `Login with Google`.

## Cookies

Runnable uses cookies to save the user's session. This means you need to provide a secret key to sign the cookies with. You can do this by setting the `RUNNABLE_SECRET` environment variable. You can easily generate a secret by running `openssl rand -hex 32` in your terminal.

## Providers

Both **Runnable Mini** and **Runnable Server** support authentication providers. You can enable one or more providers by setting the appropriate environment variables. For example, to enable Google authentication, you would set the following environment variables:

```bash
RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_ID=1234567890
RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_SECRET=abcdef
RUNNABLE_AUTH_PROVIDER_GOOGLE_HOSTNAME=https://admin.company-name.com
RUNNABLE_AUTH_PROVIDER_GOOGLE_HD=company-name.com
```

Currently the support providers are:

- Form
- Google

::: tip New Providers
We are open to add more auth providers - [please file an issue.](https://github.com/kineticio/runnable/issues)
:::

### Form Provider

The Form provider is currently only support when deploying **Runnable Mini**. It allows you to authenticate users with a simple username and password form. This is useful if your service already has authentication setup in your service.

```ts
import { authService, getUser } from './auth';

installRunnable(app, actions, {
  auth: {
    /**
     * This function is called when the user logs in.
     * The user information will be stored in Runnable's cookie session storage.
     */
    form: {
      verifyLogin: (opts) => {
        const user = authService.verifyLogin({
          email: opts.email,
          password: opts.password,
        });

        if (user.role === 'admin') {
          return user;
        }

        throw Error('Unauthorized');
      },
    },
  },
});
```
