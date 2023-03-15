import { VStack } from '@chakra-ui/react';
import { WorkflowResponse } from '@runnablejs/api';
import React from 'react';
import { FormView } from './FormView';

interface Props {
  name: string;
  form: Record<string, WorkflowResponse['prompt'] | undefined>;
}

export const CompositeFormView: React.FC<Props> = ({ name, form }) => {
  return (
    <VStack gap={2} alignItems="stretch">
      {Object.entries(form).map(([key, value]) => {
        if (!value) return null;
        return <FormView key={key} name={`${name}.${key}`} view={value} />;
      })}
    </VStack>
  );
};
