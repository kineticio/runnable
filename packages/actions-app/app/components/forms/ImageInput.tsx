import { Image, Input, Stack } from '@chakra-ui/react';
import React, { useState } from 'react';

interface Props {
  name: string;
  initialValue?: string;
}

export const ImageInput: React.FC<Props> = ({ name, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Stack>
      <Image src={value} maxHeight={200} maxWidth={400} />
      <Input
        backgroundColor="white"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://example.com/image.png"
      />
    </Stack>
  );
};
