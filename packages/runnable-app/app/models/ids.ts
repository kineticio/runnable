import { v4 } from 'uuid';

export type WorkflowId = string & { readonly brand: unique symbol };

export function createWorkflowId(id: string = uuid()): WorkflowId {
  return id as WorkflowId;
}

function uuid(): string {
  return v4();
}
