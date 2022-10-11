import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';
import React from 'react';
import { TableCellValue } from '../../api/io';
import { TableCell } from './TableCell';

interface Props {
  title?: string;
  headers: string[];
  rows: TableCellValue[][];
}

export const TableView: React.FC<Props> = ({ headers, title, rows }) => {
  return (
    <TableContainer
      overflowX="auto"
      backgroundColor="white"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
    >
      <Table variant="simple">
        <TableCaption placement="top">{title}</TableCaption>
        <Thead>
          <Tr>
            {headers.map((header) => (
              <Th key={header}>{header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, idx) => (
            <Tr key={idx}>
              {row.map((value, idx2) => (
                <TableCell key={idx2} value={value} />
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

function toPrettyString(value: TableCellValue) {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}
