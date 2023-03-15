import { components, IRunnableClient, WorkflowId, WorkflowResponse, WorkflowType } from '@runnablejs/api';
import { assertExists } from '../app/utils/assertExists.server';
import { AppConfig } from './config';

export class FederatedRunnableClient implements IRunnableClient {
  private clients: HttpRunnableClient[] = [];

  constructor(config: AppConfig) {
    for (const server of config.servers) {
      this.clients.push(
        new HttpRunnableClient({ auth: server.auth_key, host: server.host, namespace: server.namespace })
      );
    }
  }

  async listWorkflowTypes(): Promise<{
    workflows: WorkflowType[];
  }> {
    const responses = await Promise.all(
      this.clients.map((client) =>
        this.listWorkflowsNamespaced(client).catch((error) => {
          console.error(`Error listing workflows for ${client.namespace}`, error);
          return [];
        })
      )
    );
    return { workflows: responses.flat() };
  }

  startWorkflow(workflowTypeId: string): Promise<WorkflowResponse> {
    const [namespace, id] = this.parseNamespacedId(workflowTypeId);
    const client = this.clients.find((c) => c.namespace === namespace);
    assertExists(client, `Could not find client with namespace ${namespace}`);
    return client.startWorkflow(id).then((response) => ({
      ...response,
      workflowId: this.createNamespacedId(namespace, response.workflowId),
    }));
  }

  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    const [namespace, id] = this.parseNamespacedId(workflowId);
    const client = this.clients.find((c) => c.namespace === namespace);
    assertExists(client, `Could not find client with namespace ${namespace}`);
    return client.pickUpWorkflow(id as WorkflowId).then((response) => ({
      ...response,
      workflowId: this.createNamespacedId(namespace, response.workflowId),
    }));
  }

  continueWorkflow(workflowId: WorkflowId, promptResponse: { [key: string]: unknown }): Promise<WorkflowResponse> {
    const [namespace, id] = this.parseNamespacedId(workflowId);
    const client = this.clients.find((c) => c.namespace === namespace);
    assertExists(client, `Could not find client with namespace ${namespace}`);
    return client.continueWorkflow(id as WorkflowId, promptResponse).then((response) => ({
      ...response,
      workflowId: this.createNamespacedId(namespace, response.workflowId),
    }));
  }

  private async listWorkflowsNamespaced(client: HttpRunnableClient) {
    const { workflows } = await client.listWorkflowTypes();
    return workflows.map((workflow) => ({
      ...workflow,
      id: this.createNamespacedId(client.namespace, workflow.id),
    }));
  }

  private createNamespacedId(namespace: string, id: string): string {
    if (id.includes('.')) {
      throw new Error("ID cannot contain a '.'");
    }
    return [namespace, id].join('.');
  }

  private parseNamespacedId(id: string): [string, string] {
    if (!id.includes('.')) {
      throw new Error(`Could not find workflow with ID ${id}`);
    }
    return id.split('.', 2) as [string, string];
  }
}

export class HttpRunnableClient implements IRunnableClient {
  public readonly namespace: string;
  public readonly auth: string;
  public readonly host: string;

  constructor(opts: { host: string; auth: string; namespace: string }) {
    this.namespace = opts.namespace;
    this.host = opts.host;
    this.auth = opts.auth;
  }

  listWorkflowTypes(): Promise<{ workflows: components['schemas']['WorkflowType'][] }> {
    return this.fetchGet('/list-workflow-types');
  }

  startWorkflow(workflowTypeId: string): Promise<WorkflowResponse> {
    return this.fetchPost('/start-workflow', {
      workflowTypeId,
    });
  }

  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    return this.fetchGet(`/pickup-workflow/${workflowId}`);
  }

  continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse> {
    return this.fetchPost('/continue-workflow', {
      workflowId,
      promptId: '',
      response,
    });
  }

  private async fetchGet<T>(path: string): Promise<T> {
    const response = await fetch(this.getPath(path), {
      method: 'GET',
      headers: {
        ['x-runnable-auth']: this.auth,
      },
    }).then((r) => {
      if (!r.ok) return Promise.reject(r);
      return r;
    });
    return await response.json();
  }

  private async fetchPost<T>(path: string, body: any): Promise<T> {
    const response = await fetch(this.getPath(path), {
      method: 'POST',
      headers: {
        ['Content-Type']: 'application/json',
        ['x-runnable-auth']: this.auth,
      },
      body: JSON.stringify(body),
    }).then((r) => {
      if (!r.ok) return Promise.reject(r);
      return r;
    });
    return await response.json();
  }

  private getPath(path: string) {
    return `${this.host}/runnable${path}`;
  }
}
