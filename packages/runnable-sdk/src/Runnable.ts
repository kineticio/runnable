import express from 'express';
import { components, paths } from '@runnablejs/api';
import { WorkflowId } from './models/ids';
import { InMemoryWorkflowManager } from './models/workflows/workflow-manager.server';
import { RunnableWorkflows } from './types';

export interface StartOptions {
  /**
   * Optional auth token to check against x-runnable-auth header
   * This is useful if you want to run the server on a public network
   *
   * @default '0123456789'
   */
  token?: string;
  /**
   * Port to run the server on. Ideally this should be a port that is not exposed to the public internet.
   */
  port: number;
}

export type CloseServer = () => void;

type WorkflowResponse = {
  workflowId: string;
  promptId: string;
  breadcrumbs: components['schemas']['Breadcrumb'][];
  prompt: components['schemas']['WorkflowPrompt'];
};

export interface IRunnableClient {
  listWorkflowTypes(): Promise<{
    workflows: components['schemas']['WorkflowType'][];
  }>;
  startWorkflow(workflowTypeId: string): Promise<WorkflowResponse>;
  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse>;
  continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse>;
}

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

  public start(opts: StartOptions): CloseServer {
    const app = express();

    // Auth middleware
    const authToken = opts.token ?? '0123456789';
    app.use((req: any, res: any, next: any) => {
      // Check header x-runnable-auth for auth token
      if (req.headers['x-runnable-auth'] !== authToken) {
        res.status(401).send('Unauthorized');
        return;
      }
      next();
    });

    // Add body parser
    app.use(express.json());

    // Add routes
    app.get('/runnable/list-workflow-types', this.handleListWorkflows);
    app.post('/runnable/start-workflow', this.handleStartWorkflow);
    app.get('/runnable/pickup-workflow/:workflowId', this.handlePickupWorkflow);
    app.post('/runnable/continue-workflow', this.handleContinueWorkflow);

    // Start server
    app.listen(opts.port, () => {
      // eslint-disable-next-line no-console
      console.log('Starting Runnable server on port', opts.port);
    });

    return () => {
      // TODO: close server
    };
  }

  private handleListWorkflows = async (req: any, res: any) => {
    type Response = paths['/list-workflow-types']['get']['responses']['200']['content']['application/json'];
    const response: Response = await this.listWorkflowTypes();
    res.send(response);
  };

  private handleStartWorkflow = async (req: any, res: any) => {
    type Request = paths['/start-workflow']['post']['requestBody']['content']['application/json'];
    type Response = paths['/start-workflow']['post']['responses']['200']['content']['application/json'];

    const { workflowTypeId } = req.body as Request;
    const response: Response = await this.startWorkflow(workflowTypeId);
    res.send(response);
  };

  private handlePickupWorkflow = async (req: any, res: any) => {
    type Response = paths['/pickup-workflow/{workflowId}']['get']['responses']['200']['content']['application/json'];

    const { workflowId } = req.params;
    const response: Response = await this.pickUpWorkflow(workflowId as WorkflowId);
    res.send(response);
  };

  private handleContinueWorkflow = async (req: any, res: any) => {
    type Request = paths['/continue-workflow']['post']['requestBody']['content']['application/json'];
    type Response = paths['/continue-workflow']['post']['responses']['200']['content']['application/json'];

    const { workflowId, response } = req.body as Request;
    const clientResponse: Response = await this.continueWorkflow(workflowId as WorkflowId, response);
    res.send(clientResponse);
  };
}
