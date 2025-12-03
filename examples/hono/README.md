# Hono + Runnable

Example showing Runnable integration with Hono.

## Run

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000/admin` (any username/password works).

## Workflows

- **Create User** - New user with name, email, roles, and team
- **View All Users** - Table of all users
- **Delete User** - Remove a user with confirmation
- **Assign User to Team** - Reassign user to different team
- **Input Showcase** - Demo of all input types

## Project Structure

```
src/
├── main.ts         # Hono setup
└── workflows.ts    # Workflow definitions
```

## Add Workflows

Edit `src/workflows.ts`:

```typescript
export const workflows: RunnableWorkflows = {
  my_workflow: {
    title: 'My Workflow',
    description: 'What this does',
    icon: 'fa6-solid:star',
    category: 'My Category',
    execute: async (io) => {
      // workflow logic
    },
  },
};
```

## Configure Auth

Update `src/main.ts`:

```typescript
installRunnable(app, workflows, {
  auth: {
    form: {
      verifyLogin: async ({ email, password }) => {
        // verify against your database
        return { id: 'user_id', email };
      },
    },
  },
});
```

## Build

```bash
pnpm build
pnpm start
```
