import { Image, Input, Stack, Box } from '@chakra-ui/react';
import React, { useState } from 'react';

interface Props {
  name: string;
  initialValue?: string;
}

export const ImageInput: React.FC<Props> = ({ name, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Stack gap={4}>
      {value && (
        <Box
          borderRadius="lg"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
          maxWidth="fit-content"
          boxShadow="sm"
        >
          <Image src={value} maxHeight={300} maxWidth={500} objectFit="contain" />
        </Box>
      )}
      <Input
        backgroundColor="white"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://example.com/image.png"
        borderRadius="md"
        type="url"
      />
    </Stack>
  );
};
