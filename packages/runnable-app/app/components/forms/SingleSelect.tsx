import React from 'react';
import { Box, createListCollection } from '@chakra-ui/react';
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
  defaultValue?: string;
  options: {
    value: string;
    label: string;
  }[];
}

export const SingleSelect: React.FC<Props> = ({
  placeholder,
  name,
  options,
  required,
  defaultValue,
}) => {
  const collection = createListCollection({
    items: options,
  });

  return (
    <SelectRoot
      collection={collection}
      name={name}
      defaultValue={defaultValue ? [defaultValue] : undefined}
      required={required}
    >
      <SelectTrigger borderRadius="md">
        <SelectValueText placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent borderRadius="md" boxShadow="lg">
        {options.map((option) => (
          <SelectItem key={option.value} item={option} _hover={{ bg: 'gray.100' }}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
