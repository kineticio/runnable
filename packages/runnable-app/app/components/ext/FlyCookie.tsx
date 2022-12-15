import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { ClientOnly } from './ClientOnly';

/**
 * Reads the Fly instance and sets it as a cookie, so that the server can read it and redirect to the correct region.
 */
export const FlyCookie: React.FC = () => {
  return <ClientOnly>{() => <FlySetCookie />}</ClientOnly>;
};

const FlySetCookie: React.FC = () => {
  const flyInstance = getFlyInstance();

  useEffect(() => {
    if (flyInstance) {
      Cookies.set('x-runnable-fly-instance', flyInstance, {
        sameSite: 'strict',
      });
    }
  }, [flyInstance]);

  return null;
};

export const RemoveFlyCookie: React.FC = () => {
  useEffect(() => {
    Cookies.remove('x-runnable-fly-instance');
  }, []);

  return null;
};

function getFlyInstance() {
  return typeof window === 'undefined' ? undefined : window.ENV?.['FLY_ALLOC_ID'];
}
