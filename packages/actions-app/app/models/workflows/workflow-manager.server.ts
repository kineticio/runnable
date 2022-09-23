import type { Action } from '../../api/actions';
import type { ActionRequest, ActionResponse } from '../../types/response';
import type { WorkflowId } from '../ids';
import { createWorkflowId } from '../ids';
import { workflowManagerCache } from './cache.server';
import { UIResponder } from './ui-responder.server';
import { Workflow } from './workflow.server';

export class WorkflowManager {
  private mapWorkflows: Map<WorkflowId, Workflow> = workflowManagerCache();

  public getWorkflow(workflowId: WorkflowId): Workflow | undefined {
    return this.mapWorkflows.get(workflowId);
  }

  public async startWorkflow(action: Action): Promise<ActionResponse> {
    const workflowId = createWorkflowId();
    const workflow = new Workflow(workflowId, action.title, action);
    this.mapWorkflows.set(workflowId, workflow);
    const uiResponse = new UIResponder();
    workflow.start(uiResponse);
    const ui = await uiResponse.waitForResponse();
    return {
      workflowId,
      ...ui,
    };
  }

  public async pickUpWorkflow(workflowId: WorkflowId): Promise<ActionResponse> {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Response(`No workflow found with ${workflowId}`, {
        status: 404,
      });
    }
    const response = workflow.getLastResponse();
    if (!response) {
      throw new Response('Workflow is not in a state to be picked up.', {
        status: 404,
      });
    }
    return {
      workflowId,
      ...response,
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }

  public async continueWorkflow(workflowId: WorkflowId, request: ActionRequest): Promise<ActionResponse> {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Response(`No workflow found with ${workflowId}`, {
        status: 404,
      });
    }
    const uiResponse = new UIResponder();
    workflow.continue(uiResponse, request);
    const ui = await uiResponse.waitForResponse();
    return {
      workflowId,
      ...ui,
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }
}

export const WORKFLOW_MANAGER = new WorkflowManager();
