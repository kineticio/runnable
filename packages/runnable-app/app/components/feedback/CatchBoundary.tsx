import { Alert } from '@chakra-ui/react';
import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

export const DefaultCatchBoundary: React.FC = () => {
  const caught = useRouteError();
  if (!isRouteErrorResponse(caught)) {
    return (
      <Alert.Root status="error" colorPalette="red">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>
            {String(caught instanceof Error ? caught.message : caught)}
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  return (
    <Alert.Root status="error" colorPalette="red">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>
          {caught.status} {caught.data ?? caught.statusText}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
};
