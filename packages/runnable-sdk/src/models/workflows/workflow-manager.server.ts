import { WorkflowId, WorkflowResponse } from '@runnablejs/api';
import type { RunnableWorkflow } from '../../api/workflows';
import { RunnableContext } from '../../api/context';
import type { ClientResponse } from '../../types/response';
import { createWorkflowId } from '../ids';
import { WorkflowManager } from './types';
import { Workflow } from './workflow.server';

export class InMemoryWorkflowManager implements WorkflowManager {
  private mapWorkflows: Map<WorkflowId, Workflow> = new Map();

  private getWorkflow(workflowId: WorkflowId): Workflow | undefined {
    return this.mapWorkflows.get(workflowId);
  }

  public async startWorkflow(
    workflowType: RunnableWorkflow,
    context: RunnableContext,
  ): Promise<WorkflowResponse> {
    // create workflow
    const workflowId = createWorkflowId();
    const workflow = new Workflow(workflowId, workflowType.title, workflowType);

    // store in-memory
    this.mapWorkflows.set(workflowId, workflow);

    // start workflow
    const view = await workflow.start(context);

    return {
      ...view,
      workflowId,
      promptId: '',
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }

  public async pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    // get workflow
    const workflow = this.getWorkflow(workflowId);
    assertExists(workflow, `No workflow found with ${workflowId}`);

    // get last view
    const response = await workflow.getLastResponse();
    assertExists(response, `No response found for ${workflowId}`);
    return {
      ...response,
      workflowId,
      promptId: '',
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }

  public async continueWorkflow(
    workflowId: WorkflowId,
    request: ClientResponse,
  ): Promise<WorkflowResponse> {
    // get workflow
    const workflow = this.getWorkflow(workflowId);
    assertExists(workflow, `No workflow found with ${workflowId}`);

    // continue workflow
    const nextView = await workflow.continue(request);

    return {
      ...nextView,
      workflowId,
      promptId: '',
      breadcrumbs: workflow.breadcrumbs.asJson(),
    };
  }
}

function assertExists(value: unknown, message: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}
