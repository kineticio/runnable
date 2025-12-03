import { ExternalLink } from 'lucide-react';
import { Link, Table } from '@chakra-ui/react';
import { TableCellValue } from '@runnablejs/api';
import React from 'react';

interface Props {
  value: TableCellValue;
}

const cellStyles = {
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '350px',
  maxHeight: '120px',
};

export const TableCellComponent: React.FC<Props> = ({ value }) => {
  const title = toString(value);

  if (value === null) {
    return (
      <Table.Cell title={title} {...cellStyles} color="gray.400">
        <i>null</i>
      </Table.Cell>
    );
  }

  if (value === undefined) {
    return <Table.Cell title={title} {...cellStyles} />;
  }

  if (typeof value === 'string') {
    if (isDateIsoString(value)) {
      return (
        <Table.Cell title={title} {...cellStyles}>
          {formatDate(new Date(value))}
        </Table.Cell>
      );
    }

    return (
      <Table.Cell title={title} {...cellStyles}>
        {value}
      </Table.Cell>
    );
  }

  if (typeof value === 'number') {
    return (
      <Table.Cell title={title} {...cellStyles}>
        {value.toLocaleString()}
      </Table.Cell>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <Table.Cell title={title} {...cellStyles}>
        {value.toString()}
      </Table.Cell>
    );
  }

  if (typeof value === 'object') {
    if (value instanceof Date) {
      return (
        <Table.Cell title={title} {...cellStyles}>
          {formatDate(value)}
        </Table.Cell>
      );
    }

    if (value.$type === 'link') {
      return (
        <Table.Cell title={title} {...cellStyles}>
          <Link
            color="blue.600"
            href={value.href}
            target="_blank"
            rel="noopener noreferrer"
            fontWeight="medium"
            _hover={{ color: 'blue.700', textDecoration: 'underline' }}
          >
            {value.text} <ExternalLink size={12} style={{ display: 'inline', marginLeft: '2px' }} />
          </Link>
        </Table.Cell>
      );
    }

    if (value.$type === 'date') {
      return (
        <Table.Cell title={title} {...cellStyles}>
          {formatDate(new Date(value.date))}
        </Table.Cell>
      );
    }

    if (value.$type === 'image') {
      return (
        <Table.Cell {...cellStyles}>
          <img
            src={value.src}
            alt={value.alt}
            style={{ maxHeight: '80px', maxWidth: '120px', borderRadius: '4px' }}
          />
        </Table.Cell>
      );
    }

    return (
      <Table.Cell title={title} {...cellStyles}>
        {JSON.stringify(value)}
      </Table.Cell>
    );
  }

  return <Table.Cell title={title} {...cellStyles} />;
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
