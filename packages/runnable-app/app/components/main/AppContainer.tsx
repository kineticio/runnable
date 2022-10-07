import React from 'react';
import { Sidebar } from './Sidebar';

export const AppContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <Sidebar>{children}</Sidebar>;
};
