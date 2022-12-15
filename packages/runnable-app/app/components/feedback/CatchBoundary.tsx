import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useCatch } from '@remix-run/react';
import React from 'react';
import { RemoveFlyCookie } from '../ext/FlyCookie';

export const DefaultCatchBoundary: React.FC = () => {
  const caught = useCatch();
  return (
    <Alert colorScheme="red">
      <RemoveFlyCookie />
      <AlertIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {caught.status} {caught.data ?? caught.statusText}
      </AlertDescription>
    </Alert>
  );
};
