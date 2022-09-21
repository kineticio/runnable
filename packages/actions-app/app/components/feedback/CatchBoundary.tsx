import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useCatch } from '@remix-run/react';
import React from 'react';

export const DefaultCatchBoundary: React.FC = () => {
  const caught = useCatch();
  return (
    <Alert colorScheme="red">
      <AlertIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {caught.status} {caught.data ?? caught.statusText}
      </AlertDescription>
    </Alert>
  );
};
