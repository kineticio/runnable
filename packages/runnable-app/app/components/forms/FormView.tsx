import {
  Stack,
  Text,
  Input,
  FormControl,
  FormHelperText,
  FormLabel,
  Box,
  Heading,
  Flex,
  NumberInput,
  Radio,
  RadioGroup,
  CheckboxGroup,
  Checkbox,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  VStack,
  HStack,
} from '@chakra-ui/react';

import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import React from 'react';
import { WorkflowPrompt } from '@runnablejs/api';
import { CompositeFormView } from './CompositeInput';
import { TableInput } from './TableInput';
import { ImageInput } from './ImageInput';
import { MultiSelect } from './MultiSelect';
import { SingleSelect } from './SingleSelect';

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
          <Box textAlign="center" py={10} px={6}>
            <Box display="inline-block">
              <Flex
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bg={'red.500'}
                rounded={'50px'}
                w={'55px'}
                h={'55px'}
                textAlign="center"
              >
                <CloseIcon boxSize={'20px'} color={'white'} />
              </Flex>
            </Box>
            <Heading as="h2" size="xl" mt={6} mb={2}>
              {field.title}
            </Heading>
            <Text color={'gray.500'}>{field.message}</Text>
          </Box>
        );
      }
      if (field.severity === 'success') {
        return (
          <Box textAlign="center" py={10} px={6}>
            <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
            <Heading as="h2" size="xl" mt={6} mb={2}>
              {field.title}
            </Heading>
            <Text color={'gray.500'}>{field.message}</Text>
          </Box>
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
        <Alert
          status={field.severity}
          variant="subtle"
          borderRadius="md"
          boxShadow="sm"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            {field.title}
          </AlertTitle>
          <AlertDescription maxWidth="sm">{field.message}</AlertDescription>
        </Alert>
      );
    }
    // case 'message-table': {
    //   return <TableView title={field.title} headers={field.headers} rows={field.rows} />;
    // }
    case 'form-field': {
      switch (field.input.$type) {
        case 'boolean': {
          return (
            <FormControl>
              <Checkbox name={name} defaultChecked={field.defaultValue as boolean}>
                {field.label}
              </Checkbox>
              <FormHelperText>{field.helperText}</FormHelperText>
            </FormControl>
          );
        }
        case 'color': {
          return (
            <FormControl>
              <FormLabel>{field.label}</FormLabel>
              <Input backgroundColor="white" name={name} type="color" defaultValue={field.defaultValue as string} />
              <FormHelperText>{field.helperText}</FormHelperText>
            </FormControl>
          );
        }
        case 'image': {
          return (
            <FormControl>
              <FormLabel>{field.label}</FormLabel>
              <ImageInput name={name} initialValue={field.defaultValue as string} />
              <FormHelperText>{field.helperText}</FormHelperText>
            </FormControl>
          );
        }
        case 'number': {
          const isRequired = !field.optional;
          return (
            <FormControl isRequired={isRequired}>
              <FormLabel>{field.label}</FormLabel>
              <NumberInput backgroundColor="white" placeholder={field.placeholder || field.label} name={name}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>{field.helperText}</FormHelperText>
            </FormControl>
          );
        }
        case 'email':
        case 'password':
        case 'text': {
          const isRequired = !field.optional;
          return (
            <FormControl isRequired={isRequired}>
              <FormLabel>{field.label}</FormLabel>
              <Input
                backgroundColor="white"
                placeholder={field.placeholder || field.label}
                type={field.input.$type}
                name={name}
                defaultValue={field.defaultValue as string}
              />
              <FormHelperText>{field.helperText}</FormHelperText>
            </FormControl>
          );
        }
        case 'select': {
          if (field.input.display === 'dropdown') {
            return (
              <FormControl isRequired>
                <FormLabel>{field.label}</FormLabel>
                <SingleSelect
                  placeholder={field.placeholder}
                  name={name}
                  required
                  options={field.input.options}
                  defaultValue={field.defaultValue as string}
                />
                <FormHelperText>{field.helperText}</FormHelperText>
              </FormControl>
            );
          }
          if (field.input.display === 'radio') {
            return (
              <FormControl isRequired>
                <FormLabel>{field.label}</FormLabel>
                <RadioGroup name={name} defaultValue={field.defaultValue as string}>
                  <Stack>
                    {field.input.options.map((option) => (
                      <Radio key={option.value} value={option.value}>
                        {option.label}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
                <FormHelperText>{field.helperText}</FormHelperText>
              </FormControl>
            );
          }
          return null;
        }
        case 'multi-select': {
          if (field.input.display === 'dropdown') {
            return (
              <FormControl isRequired>
                <FormLabel>{field.label}</FormLabel>
                <MultiSelect
                  placeholder={field.placeholder}
                  name={name}
                  required
                  defaultValue={field.defaultValue as string[]}
                  options={field.input.options}
                />
                <FormHelperText>{field.helperText}</FormHelperText>
              </FormControl>
            );
          }
          if (field.input.display === 'checkbox') {
            return (
              <FormControl>
                <FormLabel>{field.label}</FormLabel>
                <CheckboxGroup defaultValue={field.defaultValue as string[]}>
                  <Stack>
                    {field.input.options.map((option) => (
                      <Checkbox name={name} key={option.value} value={option.value}>
                        {option.label}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
                <FormHelperText>{field.helperText}</FormHelperText>
              </FormControl>
            );
          }
          return null;
        }
        case 'table': {
          return (
            <FormControl>
              <FormLabel>{field.label}</FormLabel>
              <TableInput
                name={name}
                headers={field.input.headers}
                isMultiSelect={field.input.isMultiSelect}
                initialSelection={field.defaultValue as string[]}
                helperText={field.helperText}
                rows={field.input.rows}
              />
            </FormControl>
          );
        }
        case undefined: {
          return null;
        }
        case 'form': {
          return (
            <FormControl>
              <FormLabel>{field.label}</FormLabel>
              <CompositeFormView name={name} form={field.input.fields} />
              <FormHelperText>{field.helperText}</FormHelperText>
            </FormControl>
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
        <StackComponent gap={2} alignItems="stretch">
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
