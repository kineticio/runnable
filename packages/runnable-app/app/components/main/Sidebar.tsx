import type { ReactNode } from 'react';
import {
  BoxProps,
  FlexProps,
  IconButton,
  Box,
  CloseButton,
  Flex,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Form, Link as RemixLink } from '@remix-run/react';
import { Iconify } from '../icons/Iconify';
import { getUrl } from '../../utils/routes';

interface LinkItemProps {
  name: string;
  icon: string;
  to: `/${string}`;
}
const LinkItems: LinkItemProps[] = [
  { name: 'Actions', icon: 'fa6-solid:code', to: '/actions' },
  // { name: "Settings", icon: "fa6-solid:gear", to: "/settings" },
];

export function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'flex' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 48 }}>{children}</Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Flex
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      flexDirection={'column'}
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 48 }}
      pos="fixed"
      h="full"
      py={4}
      zIndex={2}
      gap={4}
      {...rest}
    >
      <Flex alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          Runnable
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} to={link.to}>
          {link.name}
        </NavItem>
      ))}
      <Flex flex={1} />
      <Form action={getUrl('/logout')} method="post">
        <Flex
          as="button"
          flex={1}
          align="center"
          p="2"
          px="5"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: 'cyan.100',
          }}
          type="submit"
        >
          Logout
        </Flex>
      </Form>
    </Flex>
  );
};

interface NavItemProps extends FlexProps {
  icon?: string;
  to: `/${string}`;
  children: React.ReactNode;
}
const NavItem = ({ icon, children, to, ...rest }: NavItemProps) => {
  return (
    <Link as={RemixLink} to={getUrl(to)} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="2"
        px="5"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.100',
        }}
        {...rest}
      >
        {icon && <Iconify mr="4" fontSize="16" minWidth="20px" icon={icon} />}
        {children}
      </Flex>
    </Link>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 48 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<Iconify icon="radix-icons:hamburger-menu" />}
      />

      <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
        Runnable
      </Text>
    </Flex>
  );
};
