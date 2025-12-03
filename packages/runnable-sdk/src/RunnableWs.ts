import {
  ClientToServerEvents,
  IRunnableClient,
  Logger,
  ServerToClientEvents,
} from '@runnablejs/api';
import { io, Socket } from 'socket.io-client';
import { RunnableWorkflows } from './types';
import { Runnable } from './Runnable';

export interface StartOptions {
  /**
   * Host to connect to
   * e.g `ws://localhost:3000`
   */
  runnableHost: string;
  /**
   * Namespace. This is used to dedupe between multiple instances of the same server
   * e.g. 'user-server'
   */
  namespace: string;
  /**
   * Optional logger to use for logging
   * @default console
   */
  logger?: Logger;

  /**
   * Optional auth token to check against x-runnable-auth header
   * This is useful if you want to run the server on a public network
   *
   * @default '0123456789'
   */
  token?: string;
}

export interface InitOptions {
  /**
   * Host to connect to
   * e.g `ws://localhost:3000`
   */
  runnableHost: string;
  /**
   * Namespace. This is used to dedupe between multiple instances of the same server
   * e.g. 'user-server'
   */
  namespace: string;
  /**
   * Optional logger to use for logging
   * @default console
   */
  logger?: Logger;

  /**
   * Optional auth token to check against x-runnable-auth header
   * This is useful if you want to run the server on a public network
   *
   * @default '0123456789'
   */
  token?: string;
}

/**
 * The Runnable websocket client that connects to a Runnable server
 */
export class RunnableWs {
  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private delegate: IRunnableClient;

  constructor(
    private workflows: RunnableWorkflows,
    private options: StartOptions,
  ) {
    this.delegate = new Runnable(this.workflows, {
      logger: this.options.logger ?? console,
    });
  }

  start(): void {
    const { runnableHost, token = '0123456789', logger = console, namespace } = this.options;

    logger.log(`RunnableWS starting. Connecting to ${runnableHost}`);
    this.socket = io(runnableHost, {
      auth: {
        token: token,
        namespace: namespace,
      },
    });
    this.socket.on('connect', () => {
      logger.log('RunnableWS connected');
    });

    this.socket.on('listWorkflowTypes', async (namespaceId, cb) => {
      logger.log('Handling listWorkflowTypes');
      const response = await this.delegate.listWorkflowTypes(namespaceId);
      cb(response.workflows);
    });

    this.socket.on('startWorkflow', async (workflowTypeId, context, cb) => {
      logger.log('Handling startWorkflow');
      cb(await this.delegate.startWorkflow(workflowTypeId, context));
    });

    this.socket.on('pickUpWorkflow', async (workflowId, cb) => {
      logger.log('Handling pickUpWorkflow');
      cb(await this.delegate.pickUpWorkflow(workflowId));
    });

    this.socket.on('continueWorkflow', async (workflowId, response, cb) => {
      logger.log('Handling continueWorkflow');
      cb(await this.delegate.continueWorkflow(workflowId, response));
    });

    this.socket.connect();
  }

  destroy(): void {
    this.socket.disconnect();
  }
}
