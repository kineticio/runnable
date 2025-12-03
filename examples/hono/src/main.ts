import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { installRunnable } from '@runnablejs/hono';
import { workflows } from './workflows';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development' });

const app = new Hono();

// Example route
app.get('/', (c) => {
  return c.json({
    message: 'Hello from Hono!',
    admin: '/admin',
  });
});

// Example API routes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

app.get('/api/users', (c) => {
  return c.json({
    users: [
      { id: '1', name: 'Michael Scott', email: 'michael@dundermifflin.com' },
      { id: '2', name: 'Dwight Schrute', email: 'dwight@dundermifflin.com' },
      { id: '3', name: 'Jim Halpert', email: 'jim@dundermifflin.com' },
    ],
  });
});

// Install Runnable
installRunnable(app, workflows, {
  auth: {
    form: {
      verifyLogin: async ({ email, password }) => {
        // In a real app, verify credentials against your database
        // For this example, we accept any login
        console.log('Login attempt:', { email, password });
        return {
          id: '123',
          email: email,
        };
      },
    },
  },
});

const port = Number(process.env.PORT) || 3000;

console.log(`Server is running on http://localhost:${port}`);
console.log(`Runnable admin is available at http://localhost:${port}/admin`);

serve({
  fetch: app.fetch,
  port,
});
