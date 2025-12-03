import React, { useState } from 'react';
import { createListCollection } from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '../ui/select';

interface Props {
  placeholder?: string;
  name: string;
  required?: boolean;
  defaultValue?: string[];
  options: {
    value: string;
    label: string;
  }[];
  size?: 'sm' | 'md' | 'lg';
}

export const MultiSelect: React.FC<Props> = ({
  placeholder,
  name,
  options,
  required,
  defaultValue,
  size = 'md',
}) => {
  // const [state, setState] = useState<string[]>(defaultValue || []);

  const collection = createListCollection({
    items: options,
  });

  return (
    <SelectRoot
      multiple
      collection={collection}
      size={size}
      name={name}
      // value={state}
      // onValueChange={(details) => {
      //   setState(details.value);
      // }}
    >
      <SelectTrigger backgroundColor="white" borderRadius="md">
        <SelectValueText placeholder={placeholder || 'Select options'} />
      </SelectTrigger>
      <SelectContent borderRadius="md" boxShadow="lg">
        {options.map((option) => (
          <SelectItem item={option} key={option.value} _hover={{ bg: 'gray.100' }}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
