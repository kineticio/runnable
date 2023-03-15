export type WorkflowId = string & { readonly brand: unique symbol };

export function createWorkflowId(id: string = uuid()): WorkflowId {
  return id as WorkflowId;
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
