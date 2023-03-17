import * as http from 'node:http';
import {
  ClientToServerEvents,
  InterServerEvents,
  IRunnableClient,
  Logger,
  NamespaceId,
  parseNamespacedId,
  RunnableContext,
  ServerToClientEvents,
  SocketData,
  toNamespacedId,
  WorkflowId,
  WorkflowResponse,
  WorkflowType,
  WorkflowTypeId,
} from '@runnablejs/api';
import { Server, Socket } from 'socket.io';
import { RunnableWsConnection } from './RunnableWsConnection';
import { NamespacedRunnable } from './NamespacedRunnable';

export type ClientSocket = Socket<ServerToClientEvents, ServerToClientEvents, ClientToServerEvents, SocketData>;

interface Options {
  srv?: http.Server | number;
  /**
   * The secret used to authenticate the client.
   */
  secret: string;
  logger?: Logger;
}

export type SocketId = string;

export class RunnableWsServer implements IRunnableClient {
  private readonly io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private logger: Logger;

  public clients: Map<SocketId, NamespacedRunnable> = new Map();

  /**
   * Track which socket is associated with which ongoing workflow. This is needed
   * when we have instances of the same service connected, and we need to
   * determine which socket to send the workflow response to.
   */
  private socketsByWorkflowId: Map<WorkflowId, NamespacedRunnable> = new Map();

  constructor(opts: Options) {
    this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(opts?.srv);
    this.logger = opts?.logger ?? console;

    this.io.on('connection', (socket) => {
      const namespace = socket.handshake.auth.namespace as NamespaceId;
      socket.data.namespace = namespace;

      // Authorize the socket
      if (socket.handshake.auth.token !== opts.secret) {
        this.logger.error(`Socket ${socket.id} failed to authenticate. Namespace: ${namespace}`);
        socket.disconnect();
        return;
      }

      this.logger.log(`Socket ${socket.id} connected. Namespace: ${namespace}`);

      // save the client
      const client = new RunnableWsConnection({ socket, logger: this.logger });
      this.clients.set(socket.id, new NamespacedRunnable(client, namespace));

      // listen for disconnect
      socket.on('disconnect', () => {
        this.logger.log(`Socket ${socket.id} disconnected. Namespace: ${namespace}`);

        // remove the client
        this.clients.delete(socket.id);
      });
    });
  }

  listWorkflowTypes(namespace?: NamespaceId): Promise<{ workflows: WorkflowType[] }> {
    this.logger.log('Handling listWorkflowTypes');

    const promises: Promise<{ workflows: WorkflowType[] }>[] = [];
    for (const [, socket] of this.clients) {
      if (namespace && socket.namespace !== namespace) {
        continue;
      }
      promises.push(socket.listWorkflowTypes());
    }

    return Promise.all(promises).then((responses) => {
      const ids = new Set();
      const uniqueWorkflows: WorkflowType[] = [];
      for (const response of responses) {
        for (const workflow of response.workflows) {
          if (ids.has(workflow.id)) {
            continue;
          }
          uniqueWorkflows.push(workflow);
          ids.add(workflow.id);
        }
      }
      return { workflows: uniqueWorkflows };
    });
  }

  async startWorkflow(workflowTypeId: WorkflowTypeId, context: RunnableContext): Promise<WorkflowResponse> {
    const [namespace] = parseNamespacedId(workflowTypeId);
    this.logger.log(`Starting workflow ${workflowTypeId} in namespace ${namespace}`);

    // We can start a workflow on any socket, so just pick the first one with a matching namespace
    for (const [, socket] of this.clients) {
      if (socket.namespace === namespace) {
        const response = await socket.startWorkflow(workflowTypeId, context);
        this.socketsByWorkflowId.set(response.workflowId as WorkflowId, socket);
        return response;
      }
    }

    throw new Error(`Could not find socket with namespace ${namespace}`);
  }

  async pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    const [namespace] = parseNamespacedId(workflowId);
    this.logger.log(`Picking up workflow ${workflowId} in namespace ${namespace}`);

    const socket = this.socketsByWorkflowId.get(workflowId);
    if (!socket) {
      throw new Error(`Could not find socket for workflow ${workflowId}`);
    }
    if (socket.namespace !== namespace) {
      throw new Error(`Socket is not in namespace ${namespace}`);
    }
    return socket.pickUpWorkflow(workflowId);
  }

  async continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse> {
    const [namespace] = parseNamespacedId(workflowId);
    this.logger.log(`Continuing workflow ${workflowId} in namespace ${namespace}`);

    const socket = this.socketsByWorkflowId.get(workflowId);
    if (!socket) {
      throw new Error(`Could not find socket for workflow ${workflowId}`);
    }
    if (socket.namespace !== namespace) {
      throw new Error(`Socket is not in namespace ${namespace}`);
    }
    return socket.continueWorkflow(workflowId, response);
  }

  listen(srv: http.Server | number) {
    this.io.listen(srv);
    return this;
  }

  destroy() {
    this.io.close();
  }
}
