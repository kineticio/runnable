import React, { useState } from 'react';
import { MultiSelect as ChackraMultiSelect } from 'chakra-multiselect';
import { Box, HTMLChakraProps } from '@chakra-ui/react';

interface Props extends HTMLChakraProps<'select'> {
  placeholder?: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: {
    value: string;
    label: string;
  }[];
}

export const SingleSelect: React.FC<Props> = ({ placeholder, name, options, required, defaultValue, ...rest }) => {
  const [state, setState] = useState(defaultValue);

  return (
    <Box backgroundColor="white">
      <ChackraMultiSelect
        {...rest}
        size="md"
        placeholder={placeholder}
        required={required}
        create={false}
        single={true}
        options={options}
        value={state}
        defaultValue={defaultValue}
        onChange={(value) => {
          const newState = Array.isArray(value) ? value[0] : value;
          setState(newState as string);
        }}
      />
      <input key={name} type="hidden" name={name} value={state} />
    </Box>
  );
};
