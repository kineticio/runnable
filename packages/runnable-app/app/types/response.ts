import { TableCellValue } from '../api/io';
import { BreadCrumb } from '../models/workflows/bread-crumbs.server';

export type IOForm<T = any> =
  | {
      $type: 'input';
      label: string;
      placeholder?: string;
      type?: 'text' | 'password' | 'email' | 'number';
      defaultValue?: string | number;
      optional?: boolean;
      helperText?: string;
    }
  | {
      $type: 'boolean';
      label: string;
      defaultValue?: boolean;
      helperText?: string;
    }
  | {
      $type: 'color';
      label: string;
      defaultValue?: string;
      helperText?: string;
    }
  | {
      $type: 'imageURL';
      label: string;
      defaultValue?: string;
      helperText?: string;
    }
  | {
      $type: 'terminal';
      variant: 'success' | 'error' | 'info' | 'warning';
      label: string;
      description?: string;
    }
  | {
      $type: 'message';
      variant: 'success' | 'info' | 'warning' | 'error';
      title?: string;
      description?: string;
      dangerouslySetInnerHTML?: string;
    }
  | {
      $type: 'message-table';
      title: string;
      headers: string[];
      rows: TableCellValue[][];
    }
  | {
      $type: 'select';
      display: 'radio' | 'dropdown';
      label: string;
      helperText?: string;
      placeholder?: string;
      initialSelection?: string;
      data: { label: string; value: string }[];
    }
  | {
      $type: 'multiSelect';
      display: 'checkbox' | 'dropdown';
      label: string;
      placeholder?: string;
      helperText?: string;
      initialSelection?: string[];
      data: { label: string; value: string }[];
    }
  | {
      $type: 'form';
      label?: string;
      helperText?: string;
      form: Record<string, IOForm>;
    }
  | {
      $type: 'stack';
      forms: IOForm[];
      direction: 'horizontal' | 'vertical';
    }
  | {
      $type: 'table';
      label: string;
      helperText?: string;
      headers: string[];
      isMultiSelect: boolean;
      initialSelection?: string[];
      rows: { key: string; cells: TableCellValue[] }[];
    };

export interface ActionResponse<T = any> extends ActionViewResponse<T> {
  workflowId: string;
  breadcrumbs: BreadCrumb[];
}

export interface ActionViewResponse<T = any> {
  error: string | null;
  view: IOForm<T>;
}

export interface ActionRequest<T = any> {
  ioResponse: T;
}
