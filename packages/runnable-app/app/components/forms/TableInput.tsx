import { Box, Table, Checkbox, RadioGroup } from '@chakra-ui/react';
import { TableCellValue } from '@runnablejs/api';
import React from 'react';
import { TableCellComponent } from './TableCell';

interface Props {
  helperText?: string;
  name: string;
  headers: string[];
  isMultiSelect: boolean;
  initialSelection?: string[];
  rows: { key: string; cells: TableCellValue[] }[];
}

export const TableInput: React.FC<Props> = ({
  name,
  headers,
  isMultiSelect,
  initialSelection,
  helperText,
  rows,
}) => {
  const renderCheckbox = (rowKey: string) => {
    return isMultiSelect ? (
      <Checkbox.Root name={name} value={rowKey} defaultChecked={initialSelection?.includes(rowKey)}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ) : (
      <RadioGroup.Item value={rowKey}>
        <RadioGroup.ItemHiddenInput
          name={name}
          defaultChecked={initialSelection?.includes(rowKey)}
        />
        <RadioGroup.ItemControl />
      </RadioGroup.Item>
    );
  };

  const tableContent = (
    <Box
      backgroundColor="white"
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
    >
      <Table.Root variant="outline" size="sm">
        {helperText && (
          <Table.Caption fontSize="sm" color="gray.600">
            {helperText}
          </Table.Caption>
        )}
        <Table.Header bg="gray.50">
          <Table.Row>
            <Table.ColumnHeader width="50px"></Table.ColumnHeader>
            {headers.map((header) => (
              <Table.ColumnHeader key={header} fontWeight="semibold" fontSize="sm">
                {header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row
              key={row.key}
              _hover={{ bg: 'gray.50' }}
              transition="background 0.2s"
              cursor="pointer"
            >
              <Table.Cell>{renderCheckbox(row.key)}</Table.Cell>
              {row.cells.map((value, idx) => (
                <TableCellComponent key={idx} value={value} />
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );

  return isMultiSelect ? (
    <Checkbox.Group name={name} defaultValue={initialSelection}>
      {tableContent}
    </Checkbox.Group>
  ) : (
    <RadioGroup.Root name={name} defaultValue={initialSelection?.[0]}>
      {tableContent}
    </RadioGroup.Root>
  );
};
