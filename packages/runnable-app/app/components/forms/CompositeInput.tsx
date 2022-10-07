import { VStack } from '@chakra-ui/react';
import React from 'react';
import { IOForm } from '../../types/response';
import { FormView } from './FormView';

interface Props {
  name: string;
  form: Record<string, IOForm>;
}

export const CompositeFormView: React.FC<Props> = ({ name, form }) => {
  return (
    <VStack gap={2} alignItems="stretch">
      {Object.entries(form).map(([key, value]) => (
        <FormView key={key} name={`${name}.${key}`} view={value} />
      ))}
    </VStack>
  );
};
