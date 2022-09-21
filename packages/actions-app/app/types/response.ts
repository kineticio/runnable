export type IOForm<T> =
  | {
      $type: 'input';
      label: string;
      placeholder?: string;
      type?: 'text' | 'password' | 'email' | 'number';
      helperText?: string;
    }
  | {
      $type: 'success';
      label: string;
      description?: string;
    }
  | {
      $type: 'error';
      label: string;
      description?: string;
    }
  | {
      $type: 'select';
      display: 'radio' | 'dropdown';
      label: string;
      helperText?: string;
      placeholder?: string;
      data: { label: string; value: string }[];
    }
  | {
      $type: 'multiSelect';
      display: 'checkbox' | 'dropdown';
      label: string;
      helperText?: string;
      data: { label: string; value: string }[];
    };

export interface ActionResponse<T = any> extends ActionViewResponse<T> {
  workflowId: string;
}

export interface ActionViewResponse<T = any> {
  view: IOForm<T>;
}

export interface ActionRequest<T = any> {
  ioResponse: T;
}
