import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { installRunnable } from '../index';
import { DEFAULT_WORKFLOWS } from './actions';

const app = new Hono();

installRunnable(app, DEFAULT_WORKFLOWS, {
  auth: {
    form: {
      verifyLogin: async () => {
        return {
          id: '123',
          email: '',
        };
      },
    },
  },
});

const port = 3000;
console.log(`Server started on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
