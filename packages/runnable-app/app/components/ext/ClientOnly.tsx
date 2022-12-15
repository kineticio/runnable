import React, { useEffect, useState } from 'react';

let hydrating = true;

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

interface Props {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<Props> = ({ children, fallback }) => {
  return useHydrated() ? <>{children()}</> : <>{fallback}</>;
};
