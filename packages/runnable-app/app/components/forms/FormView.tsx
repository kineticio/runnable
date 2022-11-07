import {
  Stack,
  Text,
  Input,
  Select,
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
import { IOForm } from '../../types/response';
import { CompositeFormView } from './CompositeInput';
import { TableInput } from './TableInput';
import { ImageInput } from './ImageInput';
import { TableView } from './TableView';
import { MultiSelect } from './MultiSelect';
import { SingleSelect } from './SingleSelect';

interface Props {
  name: string;
  view: IOForm<any>;
}

export const FormView: React.FC<Props> = ({ name, view }) => {
  return <Stack maxWidth="100%">{renderFormField(name, view)}</Stack>;
};

function renderFormField(name: string, field: IOForm<any>) {
  switch (field.$type) {
    case 'terminal': {
      if (field.variant === 'error') {
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
              {field.label}
            </Heading>
            <Text color={'gray.500'}>{field.description}</Text>
          </Box>
        );
      }
      if (field.variant === 'success') {
        return (
          <Box textAlign="center" py={10} px={6}>
            <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
            <Heading as="h2" size="xl" mt={6} mb={2}>
              {field.label}
            </Heading>
            <Text color={'gray.500'}>{field.description}</Text>
          </Box>
        );
      }
      return null;
    }
    case 'message': {
      if (field.dangerouslySetInnerHTML) {
        return (
          <Text>
            <div dangerouslySetInnerHTML={{ __html: field.dangerouslySetInnerHTML }} />
          </Text>
        );
      }

      return (
        <Alert
          status={field.variant}
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
          <AlertDescription maxWidth="sm">{field.description}</AlertDescription>
        </Alert>
      );
    }
    case 'message-table': {
      return <TableView title={field.title} headers={field.headers} rows={field.rows} />;
    }
    case 'boolean': {
      return (
        <FormControl>
          <Checkbox name={name} defaultChecked={field.defaultValue}>
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
          <Input backgroundColor="white" name={name} type="color" defaultValue={field.defaultValue} />
          <FormHelperText>{field.helperText}</FormHelperText>
        </FormControl>
      );
    }
    case 'imageURL': {
      return (
        <FormControl>
          <FormLabel>{field.label}</FormLabel>
          <ImageInput name={name} initialValue={field.defaultValue} />
          <FormHelperText>{field.helperText}</FormHelperText>
        </FormControl>
      );
    }
    case 'input': {
      const isRequired = !field.optional;
      if (field.type === 'number') {
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

      return (
        <FormControl isRequired={isRequired}>
          <FormLabel>{field.label}</FormLabel>
          <Input backgroundColor="white" placeholder={field.placeholder || field.label} type={field.type} name={name} />
          <FormHelperText>{field.helperText}</FormHelperText>
        </FormControl>
      );
    }
    case 'select': {
      if (field.display === 'dropdown') {
        return (
          <FormControl isRequired>
            <FormLabel>{field.label}</FormLabel>
            <SingleSelect
              placeholder={field.placeholder}
              name={name}
              required
              options={field.data}
              defaultValue={field.initialSelection}
            />
            <FormHelperText>{field.helperText}</FormHelperText>
          </FormControl>
        );
      }
      if (field.display === 'radio') {
        return (
          <FormControl isRequired>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup name={name} defaultValue={field.initialSelection}>
              <Stack>
                {field.data.map((option) => (
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
    case 'multiSelect': {
      if (field.display === 'dropdown') {
        return (
          <FormControl isRequired>
            <FormLabel>{field.label}</FormLabel>
            <MultiSelect
              placeholder={field.placeholder}
              name={name}
              required
              defaultValue={field.initialSelection}
              options={field.data}
            />
            <FormHelperText>{field.helperText}</FormHelperText>
          </FormControl>
        );
      }
      if (field.display === 'checkbox') {
        return (
          <FormControl>
            <FormLabel>{field.label}</FormLabel>
            <CheckboxGroup defaultValue={field.initialSelection}>
              <Stack>
                {field.data.map((option) => (
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
            headers={field.headers}
            isMultiSelect={field.isMultiSelect}
            initialSelection={field.initialSelection}
            helperText={field.helperText}
            rows={field.rows}
          />
        </FormControl>
      );
    }
    case 'form': {
      return (
        <FormControl>
          <FormLabel>{field.label}</FormLabel>
          <CompositeFormView name={name} form={field.form} />
          <FormHelperText>{field.helperText}</FormHelperText>
        </FormControl>
      );
    }
    case 'stack': {
      const StackComponent = field.direction === 'horizontal' ? HStack : VStack;

      return (
        <StackComponent gap={2} alignItems="stretch">
          {field.forms.map((value, idx) => (
            <FormView key={idx} name={`${name}[${idx}]`} view={value} />
          ))}
        </StackComponent>
      );
    }
    default: {
      logNever(field);
      break;
    }
  }
}

function logNever(type: never): void {
  console.warn(`Unexpected type: ${type}`);
}
