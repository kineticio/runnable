import { redirect } from 'react-router';
import { getBaseUrl } from './routes';

export function internalRedirect(url: `/${string}`, init?: number | ResponseInit) {
  return redirect(getBaseUrl() + url, init);
}
