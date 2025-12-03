import {
  Stack,
  Text,
  Input,
  Field,
  NumberInput,
  RadioGroup,
  Checkbox,
  Alert,
  VStack,
  HStack,
  Textarea,
} from '@chakra-ui/react';

import { CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { WorkflowPrompt } from '@runnablejs/api';
import { CompositeFormView } from './CompositeInput';
import { TableInput } from './TableInput';
import { ImageInput } from './ImageInput';
import { MultiSelect } from './MultiSelect';
import { SingleSelect } from './SingleSelect';
import { TableView } from './TableView';
import { EmptyState } from '../ui/empty-state';
import { PasswordInput } from '../ui/password-input';

interface Props {
  name: string;
  view: WorkflowPrompt;
}

export const FormView: React.FC<Props> = ({ name, view }) => {
  return <Stack maxWidth="100%">{renderFormField(name, view)}</Stack>;
};

function renderFormField(name: string, field: WorkflowPrompt) {
  switch (field.$type) {
    case 'terminal': {
      if (field.severity === 'error') {
        return (
          <EmptyState
            title={field.title}
            description={field.message}
            icon={<XCircle size={50} />}
          />
        );
      }
      if (field.severity === 'success') {
        return (
          <EmptyState
            title={field.title}
            description={field.message}
            icon={<CheckCircle size={50} />}
          />
        );
      }
      return null;
    }
    case 'message': {
      if (field.dangerouslySetInnerHTML) {
        return (
          <Text>
            <div dangerouslySetInnerHTML={{ __html: field.message }} />
          </Text>
        );
      }

      return (
        <Alert.Root
          status={field.severity}
          variant="subtle"
          borderRadius="lg"
          boxShadow="md"
          py={8}
        >
          <Alert.Indicator boxSize="40px" />
          <Alert.Content>
            <Alert.Title fontSize="lg" fontWeight="semibold">
              {field.title}
            </Alert.Title>
            <Alert.Description>{field.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      );
    }
    case 'table': {
      return <TableView title={field.title} headers={field.headers} rows={field.rows} />;
    }
    case 'form-field': {
      switch (field.input.$type) {
        case 'boolean': {
          return (
            <Field.Root>
              <Checkbox.Root name={name} defaultChecked={field.defaultValue as boolean}>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{field.label}</Checkbox.Label>
              </Checkbox.Root>
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case 'color': {
          return (
            <Field.Root>
              <Field.Label>{field.label}</Field.Label>
              <Input
                backgroundColor="white"
                name={name}
                type="color"
                defaultValue={field.defaultValue as string}
                borderRadius="md"
                cursor="pointer"
              />
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case 'image': {
          return (
            <Field.Root>
              <Field.Label>{field.label}</Field.Label>
              <ImageInput name={name} initialValue={field.defaultValue as string} />
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case 'number': {
          const isRequired = !field.optional;
          return (
            <Field.Root required={isRequired}>
              <Field.Label>{field.label}</Field.Label>
              <NumberInput.Root backgroundColor="white" name={name} borderRadius="md">
                <NumberInput.Input />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case 'text-area': {
          const isRequired = !field.optional;
          return (
            <Field.Root required={isRequired}>
              <Field.Label>{field.label}</Field.Label>
              <Textarea
                backgroundColor="white"
                placeholder={field.placeholder || field.label}
                name={name}
                defaultValue={field.defaultValue as string}
                borderRadius="md"
                resize="vertical"
                minHeight="100px"
              />
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case 'password': {
          const isRequired = !field.optional;
          return (
            <Field.Root required={isRequired}>
              <Field.Label>{field.label}</Field.Label>
              <PasswordInput
                placeholder={field.placeholder || field.label}
                name={name}
                defaultValue={field.defaultValue as string}
              />
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case undefined:
        case 'email':
        case 'url':
        case 'text': {
          const isRequired = !field.optional;
          return (
            <Field.Root required={isRequired}>
              <Field.Label>{field.label}</Field.Label>
              <Input
                backgroundColor="white"
                placeholder={field.placeholder || field.label}
                type={field.input.$type}
                name={name}
                defaultValue={field.defaultValue as string}
                borderRadius="md"
              />
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        case 'select': {
          if (field.input.display === 'dropdown') {
            return (
              <Field.Root required>
                <Field.Label>{field.label}</Field.Label>
                <SingleSelect
                  placeholder={field.placeholder}
                  name={name}
                  required
                  options={field.input.options}
                  defaultValue={field.defaultValue as string}
                />
                <Field.HelperText>{field.helperText}</Field.HelperText>
              </Field.Root>
            );
          }
          if (field.input.display === 'radio') {
            return (
              <Field.Root required>
                <Field.Label>{field.label}</Field.Label>
                <RadioGroup.Root name={name} defaultValue={field.defaultValue as string}>
                  <Stack gap={3}>
                    {field.input.options.map((option) => (
                      <RadioGroup.Item
                        key={option.value}
                        value={option.value}
                        p={3}
                        borderRadius="md"
                        _hover={{ bg: 'gray.50' }}
                        cursor="pointer"
                      >
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText fontWeight="medium">
                          {option.label}
                        </RadioGroup.ItemText>
                      </RadioGroup.Item>
                    ))}
                  </Stack>
                </RadioGroup.Root>
                <Field.HelperText>{field.helperText}</Field.HelperText>
              </Field.Root>
            );
          }
          return null;
        }
        case 'multi-select': {
          if (field.input.display === 'dropdown') {
            return (
              <Field.Root required>
                <Field.Label>{field.label}</Field.Label>
                <MultiSelect
                  placeholder={field.placeholder}
                  name={name}
                  required
                  defaultValue={field.defaultValue as string[]}
                  options={field.input.options}
                />
                <Field.HelperText>{field.helperText}</Field.HelperText>
              </Field.Root>
            );
          }
          if (field.input.display === 'checkbox') {
            return (
              <Field.Root>
                <Field.Label>{field.label}</Field.Label>
                <Stack gap={3}>
                  {field.input.options.map((option) => (
                    <Checkbox.Root
                      name={name}
                      key={option.value}
                      defaultChecked={(field.defaultValue as string[] | undefined)?.includes(
                        option.value,
                      )}
                      p={3}
                      borderRadius="md"
                      _hover={{ bg: 'gray.50' }}
                      cursor="pointer"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label fontWeight="medium">{option.label}</Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                </Stack>
                <Field.HelperText>{field.helperText}</Field.HelperText>
              </Field.Root>
            );
          }
          return null;
        }
        case 'table': {
          return (
            <Field.Root>
              <Field.Label>{field.label}</Field.Label>
              <TableInput
                name={name}
                headers={field.input.headers}
                isMultiSelect={field.input.isMultiSelect}
                initialSelection={field.defaultValue as string[]}
                helperText={field.helperText}
                rows={field.input.rows}
              />
            </Field.Root>
          );
        }
        case 'form': {
          return (
            <Field.Root>
              <Field.Label>{field.label}</Field.Label>
              <CompositeFormView name={name} form={field.input.fields} />
              <Field.HelperText>{field.helperText}</Field.HelperText>
            </Field.Root>
          );
        }
        default: {
          logNever(field.input);
          return;
        }
      }
    }
    case 'form': {
      return <CompositeFormView name={name} form={field.fields} />;
    }
    case 'stack': {
      const StackComponent = field.direction === 'horizontal' ? HStack : VStack;

      return (
        <StackComponent gap={4} alignItems="stretch">
          {field.items.map((value, idx) => (
            <FormView key={idx} name={`${name}[${idx}]`} view={value} />
          ))}
        </StackComponent>
      );
    }
    case undefined: {
      return null;
    }
    default: {
      logNever(field);
      break;
    }
  }
}

function logNever(type: never): void {
  console.warn(`Unexpected type: ${JSON.stringify(type)}`);
}
