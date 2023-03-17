import {
  IRunnableClient,
  NamespaceId,
  parseNamespacedId,
  RunnableContext,
  toNamespacedId,
  WorkflowId,
  WorkflowResponse,
  WorkflowType,
  WorkflowTypeId,
} from '@runnablejs/api';

export class NamespacedRunnable implements IRunnableClient {
  public namespace: NamespaceId;
  constructor(private delegate: IRunnableClient, namespace: NamespaceId) {
    this.namespace = namespace;
  }

  async listWorkflowTypes(): Promise<{ workflows: WorkflowType[] }> {
    const workflows = await this.delegate.listWorkflowTypes();
    return {
      workflows: workflows.workflows.map((workflow) => ({
        ...workflow,
        id: toNamespacedId(this.namespace, workflow.id),
      })),
    };
  }

  async startWorkflow(workflowTypeId: WorkflowTypeId, context: RunnableContext): Promise<WorkflowResponse> {
    const [, id] = parseNamespacedId(workflowTypeId);
    const response = await this.delegate.startWorkflow(id, context);
    return {
      ...response,
      workflowId: toNamespacedId(this.namespace, response.workflowId),
    };
  }

  async pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    const [, id] = parseNamespacedId(workflowId);
    const response = await this.delegate.pickUpWorkflow(id);
    return {
      ...response,
      workflowId: toNamespacedId(this.namespace, response.workflowId),
    };
  }

  async continueWorkflow(workflowId: WorkflowId, payload: { [key: string]: unknown }): Promise<WorkflowResponse> {
    const [, id] = parseNamespacedId(workflowId);
    const response = await this.delegate.continueWorkflow(id, payload);
    return {
      ...response,
      workflowId: toNamespacedId(this.namespace, response.workflowId),
    };
  }
}
