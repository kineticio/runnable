import path from 'node:path';
import type { RunnableAppContext } from '@runnablejs/app';

import { createRequestHandler, RequestHandler } from '@remix-run/express';
import express from 'express';
import resolvePackagePath from 'resolve-package-path';
import cookieParser from 'cookie-parser';
import { Runnable } from '@runnablejs/sdk';
import type { RunnableWorkflows } from '@runnablejs/sdk';
import { flyHeaderMiddleware, flyRedirectMiddleware } from './middleware';

export interface ExpressApplication {
  all(path: string, handler: RequestHandler): void;
  use(path: string, handler?: RequestHandler): void;
  use(handler: RequestHandler): void;
}

/**
 * Create a self-contained runnable app that can be installed into an existing Express app.
 */
export function installRunnable(
  app: ExpressApplication,
  workflows: RunnableWorkflows,
  context: RunnableAppContext
): void {
  const logger = context.logger || console;

  app.use(cookieParser() as RequestHandler);

  const prefix = process.env['RUNNABLE_BASE_URL'] || 'admin';
  logger.log(`Installing Runnable at /${prefix}`);

  if (context.auth.form) {
    process.env['RUNNABLE_AUTH_PROVIDER_FORM'] = 'true';
  }

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

  // Fly middleware
  app.use(`/${prefix}`, flyHeaderMiddleware());
  app.use(`/${prefix}`, flyRedirectMiddleware(logger));

  const client = new Runnable(workflows);

  app.all(`/${prefix}*`, (req, res, next) => {
    return createRequestHandler({
      build: require('@runnablejs/app/build'),
      mode: process.env['NODE_ENV'],
      getLoadContext: () => ({
        client,
        ...context,
      }),
    })(req, res, next);
  });
}

export { type RunnableWorkflows, type RunnableWorkflow, type InputOutput } from '@runnablejs/sdk';
export { type RunnableAppContext } from '@runnablejs/app';
