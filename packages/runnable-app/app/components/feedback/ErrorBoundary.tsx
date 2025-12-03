import { Alert } from '@chakra-ui/react';
import React from 'react';

interface Props {
  error: Error;
}

export const LargeErrorBoundary: React.FC<Props> = ({ error }) => {
  console.error(error);
  return (
    <Alert.Root status="error" variant="outline" colorPalette="red">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>An error occurred: {error?.message}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
};
