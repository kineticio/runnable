import * as http from 'node:http';
import {
  ClientToServerEvents,
  InterServerEvents,
  IRunnableClient,
  Logger,
  RunnableContext,
  ServerToClientEvents,
  SocketData,
  WorkflowId,
  WorkflowResponse,
  WorkflowType,
  WorkflowTypeId,
} from '@runnablejs/api';
import { Socket } from 'socket.io';

export type ClientSocket = Socket<ServerToClientEvents, ServerToClientEvents, ClientToServerEvents, SocketData>;

interface Options {
  socket: ClientSocket;
  logger: Logger;
}

export type SocketId = string;

/**
 * Wrapper around a socket connection that creates an IRunnableClient
 */
export class RunnableWsConnection implements IRunnableClient {
  public socket: ClientSocket;

  constructor(private options: Options) {
    this.socket = options.socket;
  }

  async listWorkflowTypes(): Promise<{ workflows: WorkflowType[] }> {
    const workflows = await (this.socket.timeout(1000) as ClientSocket)
      // eslint-disable-next-line unicorn/no-useless-undefined
      .emitWithAck('listWorkflowTypes', undefined)
      .catch((error) => {
        this.options.logger.error(`Could not get workflows from socket ${this.socket.id}`, error);
        return [];
      });

    return { workflows };
  }

  startWorkflow(workflowTypeId: WorkflowTypeId, context: RunnableContext): Promise<WorkflowResponse> {
    return this.socket.emitWithAck('startWorkflow', workflowTypeId, context);
  }

  pickUpWorkflow(workflowId: WorkflowId): Promise<WorkflowResponse> {
    return this.socket.emitWithAck('pickUpWorkflow', workflowId);
  }

  continueWorkflow(workflowId: WorkflowId, response: { [key: string]: unknown }): Promise<WorkflowResponse> {
    return this.socket.emitWithAck('continueWorkflow', workflowId, response);
  }
}
