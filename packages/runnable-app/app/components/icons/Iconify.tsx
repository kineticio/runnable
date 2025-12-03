import { Icon, IconifyIcon } from '@iconify/react';
import { Box, BoxProps } from '@chakra-ui/react';

interface Props extends Omit<BoxProps, 'children'> {
  icon: IconifyIcon | string;
}

export const Iconify = ({ icon, ...other }: Props): React.ReactElement => {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return <Box {...other}>xx</Box>;
  }

  return <Icon icon={icon} style={other.style} className={other.className as string} />;
};
