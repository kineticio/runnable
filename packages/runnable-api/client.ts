import { components } from './schema';

export type WorkflowId = string & { readonly brand: unique symbol };

export type WorkflowResponse = components['responses']['WorkflowResponse']['content']['application/json'];
export type WorkflowPrompt = components['schemas']['WorkflowPrompt'];
export type Breadcrumb = components['schemas']['Breadcrumb'];
export type Option = components['schemas']['Option'];

/**
 * Single runnable workflow
 */
export type WorkflowType = components['schemas']['WorkflowType'];

export interface IRunnableClient {
  listWorkflowTypes(): Promise<{ workflows: WorkflowType[] }>;
  startWorkflow(workflowTypeId: string): Promise<WorkflowResponse>;
  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse>;
  continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse>;
}
