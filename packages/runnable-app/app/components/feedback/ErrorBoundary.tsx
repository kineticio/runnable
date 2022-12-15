import { Alert } from '@chakra-ui/react';
import React from 'react';
import { RemoveFlyCookie } from '../ext/FlyCookie';

interface Props {
  error: Error;
}

export const LargeErrorBoundary: React.FC<Props> = ({ error }) => {
  console.error(error);
  return (
    <Alert variant="outline" color="red" title="Error">
      <RemoveFlyCookie />
      An error occurred: {error.message}
    </Alert>
  );
};
