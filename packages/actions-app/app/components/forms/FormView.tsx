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
} from '@chakra-ui/react';
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import React from 'react';
import { IOForm } from '../../types/response';
import { CompositeFormView } from './CompositeInput';
import { TableInput } from './TableInput';

interface Props {
  name: string;
  view: IOForm<any>;
}

export const FormView: React.FC<Props> = ({ name, view }) => {
  return <Stack>{renderFormField(name, view)}</Stack>;
};

function renderFormField(name: string, field: IOForm<any>) {
  switch (field.$type) {
    case 'success': {
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
    case 'error': {
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
    case 'input': {
      if (field.type === 'number') {
        return (
          <FormControl isRequired>
            <FormLabel>{field.label}</FormLabel>
            <NumberInput backgroundColor="white" placeholder={field.placeholder || field.label} name={name} />
            <FormHelperText>{field.helperText}</FormHelperText>
          </FormControl>
        );
      }

      return (
        <FormControl isRequired>
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
            <Select backgroundColor="white" placeholder={field.placeholder} name={name}>
              {field.data.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FormHelperText>{field.helperText}</FormHelperText>
          </FormControl>
        );
      }
      if (field.display === 'radio') {
        return (
          <FormControl isRequired>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup name={name}>
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
            <select placeholder={field.placeholder} name={name} multiple>
              {field.data.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FormHelperText>{field.helperText}</FormHelperText>
          </FormControl>
        );
      }
      if (field.display === 'checkbox') {
        return (
          <FormControl isRequired>
            <FormLabel>{field.label}</FormLabel>
            <CheckboxGroup>
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
    default:
      break;
  }
}
