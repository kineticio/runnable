import path from 'node:path';
import type { Actions, ActionsAppContext } from '@kinetic-io/actions-app';

import { createRequestHandler, RequestHandler } from '@remix-run/express';
import express from 'express';
import resolvePackagePath from 'resolve-package-path';

export interface ExpressApplication {
  all(path: string, handler: RequestHandler): void;
  use(path: string, handler?: RequestHandler): void;
}

export function installActions(app: ExpressApplication, actions: Actions, context: ActionsAppContext): void {
  // Remix fingerprints its assets so we can cache forever.
  // app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  // app.use(express.static('public', { maxAge: '1h' }));

  const prefix = process.env['ACTIONS_BASE_URL'] || 'admin';
  console.log(`Installing Kinetic at /${prefix}`);

  const { publicPath, assetsBuildDirectory } = require('@kinetic-io/actions-app/build');
  const basePath = resolvePackagePath('@kinetic-io/actions-app', __dirname);

  if (!basePath) {
    console.error('Unable to resolve @kinetic-io/actions-app');
    return;
  }

  app.use(
    publicPath,
    express.static(path.join(path.dirname(basePath), assetsBuildDirectory), { immutable: true, maxAge: '1y' })
  );

  app.all(`/${prefix}*`, (req: any, res, next) => {
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
