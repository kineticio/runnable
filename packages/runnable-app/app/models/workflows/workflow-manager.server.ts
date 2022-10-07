import type { Action } from '../../api/actions';
import type { ActionRequest, ActionResponse } from '../../types/response';
import { assertExists } from '../../utils/assertExists.server';
import type { WorkflowId } from '../ids';
import { createWorkflowId } from '../ids';
import { workflowManagerCache } from './cache.server';
import { WorkflowManager } from './types';
import { Workflow } from './workflow.server';

export class InMemoryWorkflowManager implements WorkflowManager {
  private mapWorkflows: Map<WorkflowId, Workflow> = workflowManagerCache();

  public getWorkflow(workflowId: WorkflowId): Workflow | undefined {
    return this.mapWorkflows.get(workflowId);
  }

  public async startWorkflow(action: Action): Promise<ActionResponse> {
    // create workflow
    const workflowId = createWorkflowId();
    const workflow = new Workflow(workflowId, action.title, action);

    // store in-memory
    this.mapWorkflows.set(workflowId, workflow);

    // start workflow
    const view = await workflow.start();

    return {
      ...view,
      workflowId,
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }

  public async pickUpWorkflow(workflowId: WorkflowId): Promise<ActionResponse> {
    // get workflow
    const workflow = this.getWorkflow(workflowId);
    assertExists(workflow, `No workflow found with ${workflowId}`);

    // get last view
    const response = await workflow.getLastResponse();
    assertExists(response, `No response found for ${workflowId}`);
    return {
      ...response,
      workflowId,
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }

  public async continueWorkflow(workflowId: WorkflowId, request: ActionRequest): Promise<ActionResponse> {
    // get workflow
    const workflow = this.getWorkflow(workflowId);
    assertExists(workflow, `No workflow found with ${workflowId}`);

    // continue workflow
    const nextView = await workflow.continue(request);

    return {
      ...nextView,
      workflowId,
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }
}

export const WORKFLOW_MANAGER = new InMemoryWorkflowManager();
