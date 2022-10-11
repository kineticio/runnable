import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Link, Td } from '@chakra-ui/react';
import React from 'react';
import { TableCellValue } from '../../api/io';

interface Props {
  value: TableCellValue;
}

const sx = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '350px',
  maxHeight: '120px',
};

export const TableCell: React.FC<Props> = ({ value }) => {
  const title = toString(value);

  if (value === null) {
    return (
      <Td title={title} sx={sx} color="gray.400">
        <i>null</i>
      </Td>
    );
  }

  if (value === undefined) {
    return <Td title={title} sx={sx} />;
  }

  if (typeof value === 'string') {
    if (isDateIsoString(value)) {
      return (
        <Td title={title} sx={sx}>
          {formatDate(new Date(value))}
        </Td>
      );
    }

    return (
      <Td title={title} sx={sx}>
        {value}
      </Td>
    );
  }

  if (typeof value === 'number') {
    return (
      <Td title={title} sx={sx}>
        {value.toLocaleString()}
      </Td>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <Td title={title} sx={sx}>
        {value.toString()}
      </Td>
    );
  }

  if (typeof value === 'object') {
    if (value instanceof Date) {
      return (
        <Td title={title} sx={sx}>
          {formatDate(value)}
        </Td>
      );
    }

    if (value.type === 'link') {
      return (
        <Td title={title} sx={sx}>
          <Link color="teal.800" isExternal href={value.href}>
            {value.text} <ExternalLinkIcon mx="2px" />
          </Link>
        </Td>
      );
    }

    if (value.type === 'date') {
      return (
        <Td title={title} sx={sx}>
          {formatDate(new Date(value.date))}
        </Td>
      );
    }

    if (value.type === 'image') {
      return (
        <Td sx={sx}>
          <img src={value.src} alt={value.alt} />
        </Td>
      );
    }

    return (
      <Td title={title} sx={sx}>
        {JSON.stringify(value)}
      </Td>
    );
  }

  return <Td title={title} sx={sx} />;
};

function isDateIsoString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value);
}

function formatDate(value: Date): string {
  return `${value.toDateString()}, ${value.toLocaleTimeString()}`;
}

function toString(value: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return value.toString();
}
