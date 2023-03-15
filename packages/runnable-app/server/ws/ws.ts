import * as http from 'node:http';
import {
  ClientToServerEvents,
  InterServerEvents,
  IRunnableClient,
  NamespaceId,
  ServerToClientEvents,
  SocketData,
  WorkflowId,
  WorkflowResponse,
  WorkflowType,
} from '@runnablejs/api';
import { Server, Socket } from 'socket.io';
import { Logger } from '../../app/api/context';

export type ClientSocket = Socket<ServerToClientEvents, ServerToClientEvents, ClientToServerEvents, SocketData>;

interface Options {
  srv?: http.Server | number;
  logger?: Logger;
}

export type SocketId = string;

export class RunnableWsServer implements IRunnableClient {
  private readonly io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
  private logger: Logger;

  public sockets: Map<SocketId, ClientSocket> = new Map();

  /**
   * Track which socket is associated with which ongoing workflow. This is needed
   * when we have instances of the same service connected, and we need to
   * determine which socket to send the workflow response to.
   */
  private socketsByWorkflowId: Map<WorkflowId, ClientSocket> = new Map();

  constructor(opts?: Options) {
    this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(opts?.srv);
    this.logger = opts?.logger ?? console;

    this.io.on('connection', (socket) => {
      const namespace = socket.handshake.auth.namespace as NamespaceId;
      socket.data.namespace = namespace;

      this.logger.log(`Socket ${socket.id} connected. Namespace: ${namespace}`);

      // save the socket
      this.sockets.set(socket.id, socket);

      // listen for disconnect
      socket.on('disconnect', () => {
        this.logger.log(`Socket ${socket.id} disconnected. Namespace: ${namespace}`);

        this.sockets.delete(socket.id);
      });
    });
  }

  listWorkflowTypes(namespace: NamespaceId | undefined): Promise<{ workflows: WorkflowType[] }> {
    this.logger.log('Handling listWorkflowTypes');

    const promises: Promise<WorkflowType[]>[] = [];
    for (const [id, socket] of this.sockets) {
      promises.push(
        (socket.timeout(1000) as ClientSocket)
          .emitWithAck('listWorkflowTypes', namespace)
          .then((response) =>
            response.map((workflow) => ({ ...workflow, id: `${socket.data.namespace}.${workflow.id}` }))
          )
          .catch((error) => {
            this.logger.error(`Could not get workflows from socket ${id}`, error);
            return [];
          })
      );
    }

    return Promise.all(promises).then((responses) => {
      const ids = new Set();
      const uniqueWorkflows: WorkflowType[] = [];
      for (const response of responses) {
        for (const workflow of response) {
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

  async startWorkflow(workflowTypeId: string): Promise<WorkflowResponse> {
    const [namespace, id] = this.parseNamespacedId(workflowTypeId);
    this.logger.log(`Starting workflow ${workflowTypeId} in namespace ${namespace}`);

    // We can start a workflow on any socket, so just pick the first one with a matching namespace
    for (const [, socket] of this.sockets) {
      if (socket.data.namespace === namespace) {
        const response = await socket.emitWithAck('startWorkflow', id);
        this.socketsByWorkflowId.set(response.workflowId as WorkflowId, socket);
        return {
          ...response,
          workflowId: `${socket.data.namespace}.${response.workflowId}`,
        };
      }
    }

    throw new Error(`Could not find socket with namespace ${namespace}`);
  }

  async pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    const [namespace, id] = this.parseNamespacedId(workflowId);
    this.logger.log(`Picking up workflow ${workflowId} in namespace ${namespace}`);

    const socket = this.socketsByWorkflowId.get(id);
    if (!socket) {
      throw new Error(`Could not find socket for workflow ${workflowId}`);
    }
    if (socket.data.namespace !== namespace) {
      throw new Error(`Socket ${socket.id} is not in namespace ${namespace}`);
    }
    const workflow = await socket.emitWithAck('pickUpWorkflow', id);
    return {
      ...workflow,
      workflowId: `${socket.data.namespace}.${workflow.workflowId}`,
    };
  }

  async continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse> {
    const [namespace, id] = this.parseNamespacedId(workflowId);
    this.logger.log(`Continuing workflow ${workflowId} in namespace ${namespace}`);

    const socket = this.socketsByWorkflowId.get(id);
    if (!socket) {
      throw new Error(`Could not find socket for workflow ${workflowId}`);
    }
    if (socket.data.namespace !== namespace) {
      throw new Error(`Socket ${socket.id} is not in namespace ${namespace}`);
    }
    const workflow = await socket.emitWithAck('continueWorkflow', id, response);
    return {
      ...workflow,
      workflowId: `${socket.data.namespace}.${workflow.workflowId}`,
    };
  }

  private parseNamespacedId<T extends string>(id: T): [NamespaceId, T] {
    if (!id.includes('.')) {
      throw new Error(`Could not find workflow with ID ${id}`);
    }
    return id.split('.', 2) as [NamespaceId, T];
  }

  listen(port: number) {
    this.io.listen(port);
    this.logger.log(`RunnableWsServer Listening on port ${port}`);
    return this;
  }

  destroy() {
    this.io.close();
  }
}
