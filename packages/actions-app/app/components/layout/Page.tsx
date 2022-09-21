import { Text, HStack, Flex } from '@chakra-ui/react';
import React from 'react';

interface Props {
  title?: string;
  links?: { link: string; label: string }[];
}

const HEADER_HEIGHT = '60px';

export const Page: React.FC<React.PropsWithChildren<Props>> = ({ title, children }) => {
  return (
    <Flex flexDirection="column" height="100vh">
      <HStack backgroundColor="white" px={10} height={HEADER_HEIGHT} boxShadow="md" mb={'1px'}>
        <Text>{title}</Text>
      </HStack>
      <Flex flex={1} backgroundColor="gray.50" p={10}>
        {children}
      </Flex>
    </Flex>
  );
};
