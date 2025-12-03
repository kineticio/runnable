import { Table, Box } from '@chakra-ui/react';
import { TableCellValue } from '@runnablejs/api';
import React from 'react';
import { TableCellComponent } from './TableCell';

interface Props {
  title?: string;
  headers: string[];
  rows: TableCellValue[][];
}

export const TableView: React.FC<Props> = ({ headers, title, rows }) => {
  return (
    <Box
      overflowX="auto"
      backgroundColor="white"
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
    >
      <Table.Root variant="outline" size="sm">
        {title && (
          <Table.Caption fontSize="md" fontWeight="semibold" mb={2}>
            {title}
          </Table.Caption>
        )}
        <Table.Header bg="gray.50">
          <Table.Row>
            {headers.map((header) => (
              <Table.ColumnHeader key={header} fontWeight="semibold" fontSize="sm">
                {header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, idx) => (
            <Table.Row key={idx} _hover={{ bg: 'gray.50' }} transition="background 0.2s">
              {row.map((value, idx2) => (
                <TableCellComponent key={idx2} value={value} />
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
