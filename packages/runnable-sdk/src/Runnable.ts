import { components, IRunnableClient, WorkflowId, WorkflowResponse } from '@runnablejs/api';
import { InMemoryWorkflowManager } from './models/workflows/workflow-manager.server';
import { RunnableWorkflows } from './types';

export class Runnable implements IRunnableClient {
  private workflowManager = new InMemoryWorkflowManager();

  constructor(private workflows: RunnableWorkflows) {}

  async listWorkflowTypes(): Promise<{ workflows: components['schemas']['WorkflowType'][] }> {
    return {
      workflows: Object.entries(this.workflows).map(([id, action]) => {
        return {
          id,
          title: action.title,
          category: action.category ?? '',
          icon: action.icon ?? '',
          description: action.description ?? '',
        };
      }),
    };
  }

  async startWorkflow(workflowTypeId: string): Promise<WorkflowResponse> {
    const workflow = this.workflows[workflowTypeId];
    if (!workflow) {
      throw new Error(
        `No workflow found with id ${workflowTypeId}, available workflows: ${Object.keys(this.workflows)}`
      );
    }
    return this.workflowManager.startWorkflow(workflow, {
      logger: console,
      user: { id: '123', email: '' },
    });
  }

  async pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    return this.workflowManager.pickUpWorkflow(workflowId);
  }

  async continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse> {
    return this.workflowManager.continueWorkflow(workflowId, { ioResponse: response });
  }
}
