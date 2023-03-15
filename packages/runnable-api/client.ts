import type { NamespaceId, WorkflowId } from './ids';
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
export interface IRunnableClient {
  listWorkflowTypes(namespace?: NamespaceId): Promise<{ workflows: WorkflowType[] }>;
  startWorkflow(workflowTypeId: string): Promise<WorkflowResponse>;
  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse>;
  continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse>;
}
