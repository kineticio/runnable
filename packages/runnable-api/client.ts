import type { NamespaceId, WorkflowId, WorkflowTypeId } from './ids';
import type { components } from './schema';

export type WorkflowResponse = components['responses']['WorkflowResponse']['content']['application/json'];
export type WorkflowPrompt = components['schemas']['WorkflowPrompt'];
export type TableCellValue = components['schemas']['TableCell'];
export type Breadcrumb = components['schemas']['Breadcrumb'];
export type Option = components['schemas']['Option'];

/**
 * Single runnable workflow
 */
export type WorkflowType = components['schemas']['WorkflowType'];

export interface Logger {
  log(message: any, ...optionalParams: any[]): any;
  error(message: any, ...optionalParams: any[]): any;
  warn(message: any, ...optionalParams: any[]): any;
  debug?(message: any, ...optionalParams: any[]): any;
}

export type User = components['schemas']['User'];

export interface RunnableContext {
  user: User;
}

export interface IRunnableClient {
  /**
   * List workflow types.
   */
  listWorkflowTypes(namespace?: NamespaceId): Promise<{ workflows: WorkflowType[] }>;
  /**
   * Start workflow for a given Type ID.
   */
  startWorkflow(workflowTypeId: WorkflowTypeId, context: RunnableContext): Promise<WorkflowResponse>;
  /**
   * Pickup a workflow for ID.
   */
  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse>;
  /**
   * Continue a workflow for ID, passing a user response to progress the workflow.
   */
  continueWorkflow(workflowId: WorkflowId, payload: { [key: string]: unknown }): Promise<WorkflowResponse>;
}
