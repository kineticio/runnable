import path, { dirname } from 'node:path';
import type { RunnableAppContext } from '@runnablejs/app';
import type { Hono, Context as HonoContext } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import resolvePackagePath from 'resolve-package-path';
import { NamespacedRunnable, Runnable } from '@runnablejs/sdk';
import type { RunnableWorkflows } from '@runnablejs/sdk';
import type { NamespaceId } from '@runnablejs/api';
import { flyHeaderMiddleware, flyRedirectMiddleware } from './middleware';
import { createRemixRequest, handleRemixResponse } from './remix-adapter';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createRequestHandler } from 'react-router';

/**
 * Create a self-contained runnable app that can be installed into an existing Hono app.
 */
export function installRunnable(
  app: Hono,
  workflows: RunnableWorkflows,
  context: RunnableAppContext,
): void {
  const logger = context.logger || console;

  const prefix = process.env['RUNNABLE_BASE_URL'] || 'admin';
  logger.log(`Installing Runnable at /${prefix}`);

  if (context.auth.form) {
    process.env['RUNNABLE_AUTH_PROVIDER_FORM'] = 'true';
  }

  const require = createRequire(import.meta.url);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const { publicPath, assetsBuildDirectory } = require('@runnablejs/app/build/server');
  const basePath = resolvePackagePath('@runnablejs/app', __dirname);

  if (!basePath) {
    console.error('Unable to resolve @runnablejs/app');
    return;
  }

  const assetsPath = path.join(path.dirname(basePath), assetsBuildDirectory);

  // Serve static assets
  app.use(`${publicPath}*`, serveStatic({ root: assetsPath }));

  // Fly middleware
  app.use(`/${prefix}*`, flyHeaderMiddleware());
  app.use(`/${prefix}*`, flyRedirectMiddleware(logger));

  const client = new NamespacedRunnable(
    new Runnable(workflows, { logger: console }),
    'main' as NamespaceId,
  );

  // Handle all Runnable routes
  app.all(`/${prefix}*`, async (c: HonoContext) => {
    const build = require('@runnablejs/app/build/server');

    const handler = createRequestHandler(build, process.env['NODE_ENV']);

    const remixRequest = createRemixRequest(c);
    const loadContext = {
      client,
      ...context,
    };

    const remixResponse = await handler(remixRequest, loadContext);

    return handleRemixResponse(remixResponse);
  });
}

export { type RunnableWorkflows, type RunnableWorkflow, type InputOutput } from '@runnablejs/sdk';
export { type RunnableAppContext } from '@runnablejs/app';
