import type { Actions, ActionsAppContext } from '@kinetic-io/actions-app';

import { createRequestHandler, RequestHandler } from '@remix-run/express';

export interface ExpressApplication {
  all(path: string, handler: RequestHandler): void;
}

export function installActions(app: ExpressApplication, actions: Actions, context: ActionsAppContext): void {
  // Remix fingerprints its assets so we can cache forever.
  // app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  // app.use(express.static('public', { maxAge: '1h' }));

  const prefix = process.env['ACTIONS_BASE_URL'] || 'admin';
  console.log(`Installing Kinetic at /${prefix}`);

  app.all(`/${prefix}*`, (req: any, res, next) => {
    req.url = req.url.replace(`/${prefix}`, '');
    if (req.url === '') {
      req.url = '/';
    }

    return createRequestHandler({
      build: require('@kinetic-io/actions-app/build'),
      mode: process.env['NODE_ENV'],
      getLoadContext: () => ({
        actions,
        ...context,
      }),
    })(req, res, next);
  });
}

export { type Actions, type ActionsAppContext } from '@kinetic-io/actions-app';
