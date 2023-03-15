import { WorkflowResponse } from '@runnablejs/api';
import { RunnableContext } from '../../api/context';
import { RunnableWorkflow } from '../../types';
import { ClientResponse } from '../../types/response';
import { WorkflowId } from '../ids';

/**
 * Possible form values returned by the `form` method.
 */
export type ClientFormValue = string | string[] | null | undefined;

export type WorkflowResponseView = Pick<WorkflowResponse, 'error' | 'prompt'>;

export interface WorkflowManager {
  /**
   * Start a workflow.
   * @param action The action to start the workflow with.
   * @param context The context to start the workflow with.
   * @returns The response to the action.
   */
  startWorkflow(action: RunnableWorkflow, context: RunnableContext): Promise<WorkflowResponse>;
  /**
   * Pick up a workflow.
   * @param workflowId The ID of the workflow to pick up.
   * @returns The response to the action.
   * @throws If the workflow doesn't exist.
   */
  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse>;
  /**
   * Continue a workflow.
   * @param workflowId The ID of the workflow to continue.
   * @param request The request to continue the workflow with.
   */
  continueWorkflow(workflowId: WorkflowId, request: ClientResponse): Promise<WorkflowResponse>;
}
