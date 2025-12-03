# @runnablejs/hono

Hono middleware for Runnable.

## Install

```bash
npm install @runnablejs/hono
```

## Usage

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { installRunnable } from '@runnablejs/hono';
import type { RunnableWorkflows } from '@runnablejs/hono';

const app = new Hono();

const workflows: RunnableWorkflows = {
  create_user: {
    title: 'Create User',
    description: 'Create a new user',
    icon: 'fa6-solid:user-plus',
    category: 'Users',
    execute: async (io) => {
      const { name, email } = await io.form({
        name: io.input.text({ label: 'Name', type: 'text' }),
        email: io.input.text({ label: 'Email', type: 'email' }),
      });

      // your logic here
      console.log('Creating user:', { name, email });

      await io.message.success({
        title: 'Success',
        message: `User ${name} created`,
      });
    },
  },
};

installRunnable(app, workflows, {
  auth: {
    form: {
      verifyLogin: async ({ email, password }) => {
        // verify credentials
        return { id: '123', email };
      },
    },
  },
});

app.get('/', (c) => c.text('Hello Hono!'));

serve({ fetch: app.fetch, port: 3000 });
```

Access at `http://localhost:3000/admin`.

## Configuration

### Base URL

Set `RUNNABLE_BASE_URL` to change from `/admin`:

```bash
RUNNABLE_BASE_URL=runnable node app.js
```

### Auth

```typescript
installRunnable(app, workflows, {
  auth: {
    form: {
      verifyLogin: async ({ email, password }) => {
        const user = await verifyCredentials(email, password);
        if (!user) throw new Error('Invalid credentials');
        return { id: user.id, email: user.email };
      },
    },
  },
  logger: console, // optional
});
```

## API

### `installRunnable(app, workflows, context)`

- `app` - Hono instance
- `workflows` - Workflow definitions
- `context` - Config object:
  - `auth.form.verifyLogin` - Credential verification function
  - `logger` (optional) - Custom logger

## License

MIT
