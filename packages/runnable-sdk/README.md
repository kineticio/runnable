# @runnablejs/sdk

Core SDK for creating and running Runnable workflows.

## Install

```bash
npm install @runnablejs/sdk
```

## Usage

For most use cases, use `@runnablejs/express` or `@runnablejs/hono` instead, which bundle this SDK with a UI.

### Define Workflows

```typescript
import type { RunnableWorkflows } from '@runnablejs/sdk';

const workflows: RunnableWorkflows = {
  my_workflow: {
    title: 'My Workflow',
    description: 'What this workflow does',
    icon: 'fa6-solid:star',
    category: 'Category',
    execute: async (io, context) => {
      const input = await io.input.text({
        label: 'Name',
        type: 'text',
      });

      // your logic
      console.log('Input:', input);

      await io.message.success({
        title: 'Done',
        message: 'Workflow completed',
      });
    },
  },
};
```

### Run Workflows

```typescript
import { Runnable } from '@runnablejs/sdk';

const client = new Runnable(workflows, { logger: console });

// Programmatic execution
await client.run('my_workflow', context);
```

## Classes

### `Runnable`

Core workflow runner.

```typescript
const client = new Runnable(workflows, options);
```

### `NamespacedRunnable`

Workflow runner with namespace support for multi-tenant setups.

```typescript
const client = new NamespacedRunnable(runnable, namespaceId);
```

### `RunnableWs`

WebSocket client for connecting to Runnable servers.

## Types

### `RunnableWorkflow`

```typescript
interface RunnableWorkflow {
  title: string;
  description: string;
  icon: string; // Iconify icon name
  category: string;
  execute: (io: InputOutput, context: RunnableContext) => Promise<void>;
}
```

### `InputOutput`

The `io` object provides methods for user interaction:

- `io.input.*` - Input components (text, number, select, etc.)
- `io.form()` - Multi-input forms
- `io.select.*` - Selection components (table, dropdown, etc.)
- `io.message.*` - Display messages (success, error, info)

## License

MIT
