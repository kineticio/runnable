import {
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Checkbox,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';
import React from 'react';
import { TableCell } from './TableCell';

interface Props {
  helperText?: string;
  name: string;
  headers: string[];
  isMultiSelect: boolean;
  initialSelection?: string[];
  rows: { key: string; cells: string[] }[];
}

export const TableInput: React.FC<Props> = ({ name, headers, isMultiSelect, initialSelection, helperText, rows }) => {
  const renderCheckbox = (rowKey: string) => {
    return isMultiSelect ? (
      <Checkbox name={name} value={rowKey} defaultChecked={initialSelection?.includes(rowKey)} />
    ) : (
      <Radio name={name} value={rowKey} defaultChecked={initialSelection?.includes(rowKey)} />
    );
  };

  return (
    <RadioGroup name={name}>
      <TableContainer
        backgroundColor="white"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
      >
        <Table variant="simple">
          <TableCaption>{helperText}</TableCaption>
          <Thead>
            <Tr>
              {/* checkbox */}
              <Th></Th>
              {headers.map((header) => (
                <Th key={header}>{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.key}>
                {/* checkbox */}
                <Td>{renderCheckbox(row.key)}</Td>
                {row.cells.map((value, idx) => (
                  <TableCell key={idx} value={value} />
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </RadioGroup>
  );
};
