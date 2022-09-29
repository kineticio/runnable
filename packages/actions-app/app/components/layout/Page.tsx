import { HStack, Flex, Text } from '@chakra-ui/react';
import { useTransition } from '@remix-run/react';
import { motion } from 'framer-motion';

import React from 'react';

interface Props {
  title?: string[] | string;
  links?: { link: string; label: string }[];
  animationKey?: string;
}

const HEADER_HEIGHT = '60px';

export const Page: React.FC<React.PropsWithChildren<Props>> = ({ title, children, animationKey }) => {
  const transition = useTransition();
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
        <motion.main
          key={animationKey}
          initial={{ x: '-10%', opacity: 0 }}
          animate={{ x: '0', opacity: 1 }}
          exit={{ y: '-10%', opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {transition.state !== 'loading' && children}
        </motion.main>
      </Flex>
    </Flex>
  );
};
