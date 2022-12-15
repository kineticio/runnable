import React from 'react';
import { FlyCookie } from '../ext/FlyCookie';
import { Sidebar } from './Sidebar';

export const AppContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Sidebar>
      <FlyCookie />
      {children}
    </Sidebar>
  );
};
