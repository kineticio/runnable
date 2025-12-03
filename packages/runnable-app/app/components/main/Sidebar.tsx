import type { ReactNode } from 'react';
import {
  BoxProps,
  FlexProps,
  IconButton,
  Box,
  CloseButton,
  Flex,
  Link,
  Drawer,
  Text,
  useDisclosure,
  Separator,
} from '@chakra-ui/react';
import { Form, Link as RemixLink, useLocation } from 'react-router';
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
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg="gray.50">
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'flex' }} />
      <Drawer.Root
        open={open}
        placement="start"
        onOpenChange={(e) => (e.open ? onOpen() : onClose())}
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <SidebarContent onClose={onClose} />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
      {/* mobilenav */}
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }}>{children}</Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { direction: _direction, ...flexRest } = rest as any;
  return (
    <Flex
      bg="gray.900"
      borderRight="1px"
      flexDirection="column"
      borderRightColor="gray.800"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      py={6}
      zIndex={2}
      gap={2}
      {...flexRest}
    >
      <Flex alignItems="center" px="6" mb={4}>
        <Box>
          <Text fontSize="xl" fontWeight="bold" color="white" letterSpacing="tight">
            Runnable
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            Admin Portal
          </Text>
        </Box>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} color="white" />
      </Flex>

      <Separator borderColor="gray.800" mb={2} />

      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} to={link.to}>
          {link.name}
        </NavItem>
      ))}

      <Flex flex={1} />

      <Separator borderColor="gray.800" mb={2} />

      <Form action={getUrl('/logout')} method="post">
        <button
          type="submit"
          style={{
            background: 'transparent',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Flex
            align="center"
            px="6"
            py="3"
            mx="3"
            borderRadius="md"
            role="group"
            cursor="pointer"
            color="gray.400"
            transition="all 0.2s"
            _hover={{
              bg: 'gray.800',
              color: 'white',
            }}
          >
            <Iconify mr="3" fontSize="18" icon="fa6-solid:arrow-right-from-bracket" />
            <Text fontSize="sm" fontWeight="medium">
              Logout
            </Text>
          </Flex>
        </button>
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
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link asChild style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <RemixLink to={getUrl(to)}>
        <Flex
          align="center"
          px="6"
          py="3"
          mx="3"
          borderRadius="md"
          role="group"
          cursor="pointer"
          color={isActive ? 'white' : 'gray.400'}
          bg={isActive ? 'gray.800' : 'transparent'}
          fontWeight={isActive ? 'semibold' : 'medium'}
          transition="all 0.2s"
          _hover={{
            bg: isActive ? 'gray.800' : 'gray.800',
            color: 'white',
          }}
          {...rest}
        >
          {icon && <Iconify mr="3" fontSize="18" icon={icon} />}
          <Text fontSize="sm">{children}</Text>
        </Flex>
      </RemixLink>
    </Link>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 8 }}
      height="16"
      alignItems="center"
      bg="white"
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton variant="outline" onClick={onOpen} aria-label="open menu">
        <Iconify icon="radix-icons:hamburger-menu" />
      </IconButton>

      <Box ml="4">
        <Text fontSize="lg" fontWeight="bold" letterSpacing="tight">
          Runnable
        </Text>
        <Text fontSize="xs" color="gray.500">
          Admin Portal
        </Text>
      </Box>
    </Flex>
  );
};
