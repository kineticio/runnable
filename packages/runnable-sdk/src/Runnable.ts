import {
  IRunnableClient,
  Logger,
  RunnableContext,
  WorkflowId,
  WorkflowResponse,
  WorkflowType,
  WorkflowTypeId,
} from '@runnablejs/api';
import { InMemoryWorkflowManager } from './models/workflows/workflow-manager.server';
import { RunnableWorkflow, RunnableWorkflows } from './types';

interface RunnableOptions {
  logger: Logger;
}

export class Runnable implements IRunnableClient {
  private workflowManager = new InMemoryWorkflowManager();
  private workflows: Record<WorkflowTypeId, RunnableWorkflow>;

  constructor(workflows: RunnableWorkflows, private opts: RunnableOptions) {
    this.workflows = workflows;
  }

  async listWorkflowTypes(): Promise<{ workflows: WorkflowType[] }> {
    return {
      workflows: Object.entries(this.workflows).map(([id, action]) => {
        return {
          id: id,
          title: action.title,
          category: action.category,
          icon: action.icon,
          description: action.description,
        };
      }),
    };
  }

  async startWorkflow(workflowTypeId: WorkflowTypeId, context: RunnableContext): Promise<WorkflowResponse> {
    const workflow = this.workflows[workflowTypeId];
    if (!workflow) {
      throw new Error(
        `No workflow found with id ${workflowTypeId}, available workflows: ${Object.keys(this.workflows)}`
      );
    }
    return this.workflowManager.startWorkflow(workflow, {
      logger: this.opts.logger,
      user: context.user,
    });
  }

  async pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    return this.workflowManager.pickUpWorkflow(workflowId);
  }

  async continueWorkflow(workflowId: WorkflowId, payload: { [key: string]: unknown }): Promise<WorkflowResponse> {
    return this.workflowManager.continueWorkflow(workflowId, { ioResponse: payload });
  }
}
