import { HStack, Flex, Text, } from '@chakra-ui/react';

import React from 'react';

interface Props {
  title?: string[] | string;
  links?: { link: string; label: string }[];
}

const HEADER_HEIGHT = '60px';

export const Page: React.FC<React.PropsWithChildren<Props>> = ({ title, children }) => {
  const titles = Array.isArray(title) ? title : [title];
  return (
    <Flex flexDirection="column" height="100vh">
      <HStack backgroundColor="white" px={10} height={HEADER_HEIGHT} boxShadow="md" mb={'1px'}>
        <HStack gap={2} divider={<span>/</span>}>
          {titles.map((t) => (
            <Text key={t} fontWeight={600}>
              {t}
            </Text>
          ))}
        </HStack>
      </HStack>
      <Flex flex={1} backgroundColor="gray.50" p={10}>
        {children}
      </Flex>
    </Flex>
  );
};
