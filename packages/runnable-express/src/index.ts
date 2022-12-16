import path from 'node:path';
import type { Actions, RunnableAppContext } from '@runnablejs/app';

import { createRequestHandler, RequestHandler } from '@remix-run/express';
import express from 'express';
import resolvePackagePath from 'resolve-package-path';
import cookieParser from 'cookie-parser';

export interface ExpressApplication {
  all(path: string, handler: RequestHandler): void;
  use(path: string, handler?: RequestHandler): void;
  use(handler: RequestHandler): void;
}

export function installRunnable(app: ExpressApplication, actions: Actions, context: RunnableAppContext): void {
  const logger = context.logger || console;

  app.use(cookieParser() as RequestHandler);

  // Remix fingerprints its assets so we can cache forever.
  // app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  // app.use(express.static('public', { maxAge: '1h' }));

  const prefix = process.env['ACTIONS_BASE_URL'] || 'admin';
  logger.log(`Installing Runnable at /${prefix}`);

  const { publicPath, assetsBuildDirectory } = require('@runnablejs/app/build');
  const basePath = resolvePackagePath('@runnablejs/app', __dirname);

  if (!basePath) {
    console.error('Unable to resolve @runnablejs/app');
    return;
  }

  app.use(
    publicPath,
    express.static(path.join(path.dirname(basePath), assetsBuildDirectory), { immutable: true, maxAge: '1y' })
  );

  // Add useful Fly headers to all responses
  app.use(`/${prefix}`, async (_req, res: any, next: any) => {
    // See https://fly.io/docs/reference/runtime-environment/ for runtime env vars
    const flyRegion = process.env['FLY_REGION'];
    const flyInstance = process.env['FLY_ALLOC_ID'];
    if (flyRegion) {
      res.set('x-fly-region', flyRegion);
    }
    if (flyInstance) {
      res.set('x-fly-instance', flyInstance);
    }

    next();
  });

  // If the client has set 'x-runnable-fly-instance', then we want to redirect to that instance.
  app.use(`/${prefix}`, async (req: any, res: any, next: any) => {
    // If we are not a fly instance, then we don't need to do anything
    const { PRIMARY_REGION, FLY_REGION } = process.env;
    if (!PRIMARY_REGION || !FLY_REGION) {
      next();
      return;
    }

    const { method, path: pathname } = req;
    const isMethodReplayable = !['OPTIONS', 'HEAD'].includes(method);
    const isReadOnlyRegion = FLY_REGION !== PRIMARY_REGION;
    const shouldReplay = isMethodReplayable && isReadOnlyRegion;
    if (!shouldReplay) return next();

    const logInfo = {
      pathname,
      method,
      PRIMARY_REGION,
      FLY_REGION,
    };
    logger.log(`Replaying:`, logInfo);
    res.set('fly-replay', `region=${PRIMARY_REGION}`);
    return res.sendStatus(409);
    next();
  });

  app.all(`/${prefix}*`, (req, res, next) => {
    return createRequestHandler({
      build: require('@runnablejs/app/build'),
      mode: process.env['NODE_ENV'],
      getLoadContext: () => ({
        actions,
        ...context,
      }),
    })(req, res, next);
  });
}

export { type Actions, type RunnableAppContext, type Action, type InputOutput } from '@runnablejs/app';
