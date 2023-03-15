import { redirect } from '@remix-run/server-runtime';
import { getBaseUrl } from './routes';

export function internalRedirect(url: `/${string}`, init?: number | ResponseInit) {
  return redirect(getBaseUrl() + url, init);
}
