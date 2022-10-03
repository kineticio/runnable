import { Action } from '../../types';
import { ActionResponse, ActionRequest } from '../../types/response';
import { WorkflowId } from '../ids';
import { Workflow } from './workflow.server';

/**
 * Possible form values returned by the `form` method.
 */
export type ClientFormValue = string | string[] | null | undefined;

export interface WorkflowManager {
  /**
   * Get a workflow by its ID.
   * @param workflowId The ID of the workflow to get.
   * @returns The workflow, or `undefined` if it doesn't exist.
   */
  getWorkflow(workflowId: WorkflowId): Workflow | undefined;
  /**
   * Start a workflow.
   * @param action The action to start the workflow with.
   * @returns The response to the action.
   */
  startWorkflow(action: Action): Promise<ActionResponse>;
  /**
   * Pick up a workflow.
   * @param workflowId The ID of the workflow to pick up.
   * @returns The response to the action.
   * @throws If the workflow doesn't exist.
   */
  pickUpWorkflow(workflowId: WorkflowId): Promise<ActionResponse>;
  /**
   * Continue a workflow.
   * @param workflowId The ID of the workflow to continue.
   * @param request The request to continue the workflow with.
   */
  continueWorkflow(workflowId: WorkflowId, request: ActionRequest): Promise<ActionResponse>;
}
