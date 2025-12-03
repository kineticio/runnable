import { redirect } from 'react-router';

declare global {
  interface Window {
    ENV: Record<string, string | undefined>;
  }
}

export function getBaseUrl(): string {
  const envUrl =
    typeof window === 'undefined'
      ? process.env['RUNNABLE_BASE_URL']
      : window.ENV?.['RUNNABLE_BASE_URL'];
  const base = envUrl ?? '/admin';
  if (base === '/') {
    return '';
  }
  if (base.startsWith('/')) {
    return base;
  }
  return `/${base}`;
}

export function internalRedirect(url: `/${string}`, init?: number | ResponseInit) {
  return redirect(getBaseUrl() + url, init);
}

export function getUrl(url: `/${string}`): string {
  return getBaseUrl() + url;
}
