import type { RequestHandler } from '@react-router/express';
import type { Logger } from '@runnablejs/api';

/**
 * Add useful Fly headers to all responses
 */
export function flyHeaderMiddleware(): RequestHandler {
  return async (_req, res, next) => {
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
  };
}

/**
 * If the client has set 'x-runnable-fly-instance', then we want to redirect to that instance.
 */
export function flyRedirectMiddleware(logger: Logger): RequestHandler {
  return async (req, res, next) => {
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
    if (!shouldReplay) {
      next();
      return;
    }

    const logInfo = {
      pathname,
      method,
      PRIMARY_REGION,
      FLY_REGION,
    };

    logger.log(`Replaying:`, logInfo);
    res.set('fly-replay', `region=${PRIMARY_REGION}`);
    res.sendStatus(409);
    return;
  };
}
