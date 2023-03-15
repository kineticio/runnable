import type { WorkflowType, WorkflowResponse } from './client';
import type { WorkflowId, NamespaceId } from './ids';

export interface ServerToClientEvents {
  listWorkflowTypes: (namespace: NamespaceId | undefined, callback: (workflows: WorkflowType[]) => void) => void;
  startWorkflow: (workflowTypeId: string, callback: (response: WorkflowResponse) => void) => void;
  pickUpWorkflow: (workflowId: WorkflowId, callback: (response: WorkflowResponse) => void) => void;
  continueWorkflow: (
    workflowId: WorkflowId,
    response: { [key: string]: unknown },
    callback: (response: WorkflowResponse) => void
  ) => void;
}

export interface ClientToServerEvents {
  // no events
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  namespace: NamespaceId;
}
