import type { MiddlewareHandler, Context } from 'hono';
import type { Logger } from '@runnablejs/api';

/**
 * Add useful Fly headers to all responses
 */
export function flyHeaderMiddleware(): MiddlewareHandler {
  return async (c: Context, next) => {
    // See https://fly.io/docs/reference/runtime-environment/ for runtime env vars
    const flyRegion = process.env['FLY_REGION'];
    const flyInstance = process.env['FLY_ALLOC_ID'];

    if (flyRegion) {
      c.header('x-fly-region', flyRegion);
    }
    if (flyInstance) {
      c.header('x-fly-instance', flyInstance);
    }

    await next();
  };
}

/**
 * If the client has set 'x-runnable-fly-instance', then we want to redirect to that instance.
 */
export function flyRedirectMiddleware(logger: Logger): MiddlewareHandler {
  return async (c: Context, next) => {
    // If we are not a fly instance, then we don't need to do anything
    const { PRIMARY_REGION, FLY_REGION } = process.env;
    if (!PRIMARY_REGION || !FLY_REGION) {
      await next();
      return;
    }

    const { method } = c.req;
    const pathname = c.req.path;
    const isMethodReplayable = !['OPTIONS', 'HEAD'].includes(method);
    const isReadOnlyRegion = FLY_REGION !== PRIMARY_REGION;
    const shouldReplay = isMethodReplayable && isReadOnlyRegion;

    if (!shouldReplay) {
      await next();
      return;
    }

    const logInfo = {
      pathname,
      method,
      PRIMARY_REGION,
      FLY_REGION,
    };

    logger.log(`Replaying:`, logInfo);
    c.header('fly-replay', `region=${PRIMARY_REGION}`);
    return c.body(null, 409);
  };
}
