import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';
import React from 'react';
import { Primitive } from '../../api/actions';

interface Props {
  title?: string;
  headers: string[];
  rows: Primitive[][];
}

export const TableView: React.FC<Props> = ({ headers, title, rows }) => {
  return (
    <TableContainer backgroundColor="white" boxShadow="sm" border="1px solid" borderColor="gray.200" borderRadius="md">
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
              {row.map((cell, idx2) => (
                <Td key={idx2 + '_' + cell}>{toPrettyString(cell)}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

function toPrettyString(value: Primitive) {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}
