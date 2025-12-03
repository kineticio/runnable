import { HStack, Flex, Text } from '@chakra-ui/react';
import { useNavigation } from 'react-router';

import React from 'react';

interface Props {
  title?: string[] | string;
  links?: { link: string; label: string }[];
  animationKey?: string;
}

const HEADER_HEIGHT = '64px';

export const Page: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  children,
  animationKey,
}) => {
  const transition = useNavigation();
  const titles = Array.isArray(title) ? title : [title];
  return (
    <Flex flexDirection="column" height="100vh">
      <Flex
        backgroundColor="white"
        px={8}
        height={HEADER_HEIGHT}
        borderBottomWidth="1px"
        borderBottomColor="gray.200"
        flexShrink={0}
        flexGrow={0}
        alignItems="center"
      >
        <HStack gap={2.5}>
          {titles.map((t, index) => (
            <React.Fragment key={t}>
              {index > 0 && (
                <Text color="gray.400" fontSize="sm" fontWeight="normal">
                  /
                </Text>
              )}
              <Text
                fontSize={index === titles.length - 1 ? 'lg' : 'sm'}
                fontWeight={index === titles.length - 1 ? 'bold' : 'medium'}
                color={index === titles.length - 1 ? 'gray.900' : 'gray.600'}
              >
                {t}
              </Text>
            </React.Fragment>
          ))}
        </HStack>
      </Flex>
      <Flex
        flex={1}
        backgroundColor="gray.50"
        p={8}
        overflowY="auto"
        _open={{
          animation: 'fade-in 200ms ease-out',
        }}
        key={animationKey}
      >
        {transition.state !== 'loading' && children}
      </Flex>
    </Flex>
  );
};
