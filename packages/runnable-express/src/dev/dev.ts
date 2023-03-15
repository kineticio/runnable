import express from 'express';
import { installRunnable } from '../index';
import { DEFAULT_WORKFLOWS } from './actions';

const app = express();

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

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started on http://localhost:3000');
});
