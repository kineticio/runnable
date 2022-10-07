import { Icon, IconifyIcon } from '@iconify/react';
import { Box, BoxProps } from '@chakra-ui/react';

interface Props extends BoxProps {
  icon: IconifyIcon | string;
}

export const Iconify = ({ icon, sx, ...other }: Props): React.ReactElement => {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return (
      <Box sx={{ ...sx }} {...other}>
        xx
      </Box>
    );
  }

  return <Box as={Icon} icon={icon} sx={{ ...sx }} {...other} />;
};
