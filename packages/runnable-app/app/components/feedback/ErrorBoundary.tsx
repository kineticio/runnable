import { Alert } from '@chakra-ui/react';
import React from 'react';

interface Props {
  error: Error;
}

export const LargeErrorBoundary: React.FC<Props> = ({ error }) => {
  console.log(error);
  return (
    <Alert variant="outline" color="red" title="Error">
      An error occurred: {error.message}
    </Alert>
  );
};
