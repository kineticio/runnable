import type { Context as HonoContext } from 'hono';

/**
 * Convert a Hono request to a Remix request
 */
export function createRemixRequest(c: HonoContext): Request {
  const url = new URL(c.req.url);

  const init: RequestInit = {
    method: c.req.method,
    headers: c.req.raw.headers,
  };

  // Add body for non-GET/HEAD requests
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    init.body = c.req.raw.body;
    init.duplex = 'half';
  }

  return new Request(url.toString(), init);
}

/**
 * Convert a Remix response to a Hono response
 */
export async function handleRemixResponse(remixResponse: Response): Promise<Response> {
  // Return the Remix response directly to preserve all response details
  return remixResponse;
}
