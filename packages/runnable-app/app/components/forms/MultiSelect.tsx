import React, { useState } from 'react';
import { MultiSelect as ChackraMultiSelect } from 'chakra-multiselect';
import { Box, HTMLChakraProps } from '@chakra-ui/react';

interface Props extends HTMLChakraProps<'select'> {
  placeholder?: string;
  name: string;
  required?: boolean;
  defaultValue?: string[];
  options: {
    value: string;
    label: string;
  }[];
}

export const MultiSelect: React.FC<Props> = ({ placeholder, name, options, required, defaultValue, ...rest }) => {
  const [state, setState] = useState<string[]>(defaultValue || []);

  return (
    <Box backgroundColor="white">
      <ChackraMultiSelect
        {...rest}
        backgroundColor="white"
        placeholder={placeholder}
        required={required}
        create={false}
        single={false}
        options={options}
        value={state}
        defaultValue={defaultValue}
        onChange={(value) => {
          const newState = Array.isArray(value) ? value : [value];
          setState(newState as string[]);
        }}
      />
      {state.length > 0 && state.map((item) => <input key={name} type="hidden" name={name} value={item} />)}
    </Box>
  );
};
