/**
 * @jest-environment node
 */
import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { NamespaceId, ServerToClientEvents, WorkflowId, WorkflowPrompt, WorkflowTypeId } from '@runnablejs/api';
import { connect, Socket } from 'socket.io-client';
import { RunnableWsServer } from '../ws/RunnableWsServer';

type NoInfer<T> = [T][T extends any ? 0 : never];
const prompt: WorkflowPrompt = { $type: 'message', title: 'name?', severity: 'info', message: '' };

const context = {
  user: {
    id: '1',
    name: 'M Scott',
    email: 'mscott@dm.com',
  },
};

function partial<T>(payload: Partial<NoInfer<T>>): T {
  return payload as T;
}

describe('my awesome project', () => {
  let io: RunnableWsServer;
  // let serverSocket: ServerSocket;
  let userService: Socket<ServerToClientEvents, ServerToClientEvents>;
  let userService2: Socket<ServerToClientEvents, ServerToClientEvents>;
  let emailService: Socket<ServerToClientEvents, ServerToClientEvents>;
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
  const started = jest.fn();
  const continued = jest.fn();
  const pickup = jest.fn();
  const httpServer = createServer();

  beforeEach((done) => {
    io = new RunnableWsServer({ srv: httpServer, logger, secret: '012345' });
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      // Connect user service
      userService = connect(`http://localhost:${port}`, {
        auth: { namespace: 'user-service', token: '012345' },
      });
      userService.on('connect', () => {
        // Connect email service
        emailService = connect(`http://localhost:${port}`, {
          auth: { namespace: 'email-service', token: '012345' },
        });
        emailService.on('connect', () => {
          // Connect another user service
          userService2 = connect(`http://localhost:${port}`, {
            auth: { namespace: 'user-service', token: '012345' },
          });
          userService2.on('connect', () => {
            done();
          });
        });
      });
    });
  });

  it('should be able to list all workflow types from different clients', async () => {
    userService.on('listWorkflowTypes', (namespace, cb) => {
      cb([partial({ id: 'create-user', title: 'Create User' })]);
    });
    emailService.on('listWorkflowTypes', (namespace, cb) => {
      cb([partial({ id: 'send-email', title: 'Send Email' })]);
    });
    // Will dedupe multiple instances of the same workflow
    userService2.on('listWorkflowTypes', (namespace, cb) => {
      cb([partial({ id: 'create-user', title: 'Create User' })]);
    });
    const response = await io.listWorkflowTypes();
    expect(response.workflows).toMatchInlineSnapshot(`
      [
        {
          "id": "user-service.create-user",
          "title": "Create User",
        },
        {
          "id": "email-service.send-email",
          "title": "Send Email",
        },
      ]
    `);
  });

  it('should be able to list workflows even if any fails', async () => {
    userService.on('listWorkflowTypes', (namespace, cb) => {
      cb([partial({ id: 'create-user', title: 'Create User' })]);
    });

    emailService.on('listWorkflowTypes', (namespace, cb) => {
      cb([]);
    });

    const response = await io.listWorkflowTypes();
    // expect userService2 to timeout
    expect(logger.error).toBeCalledTimes(1);
    expect(response.workflows).toMatchInlineSnapshot(`
      [
        {
          "id": "user-service.create-user",
          "title": "Create User",
        },
      ]
    `);
  });

  it('should just graph workflow in the namespace', async () => {
    userService.on('listWorkflowTypes', (namespace, cb) => {
      cb([partial({ id: 'create-user', title: 'Create User' })]);
    });

    emailService.on('listWorkflowTypes', (namespace, cb) => {
      cb([partial({ id: 'send-email', title: 'Send Email' })]);
    });

    const response = await io.listWorkflowTypes('email-service' as NamespaceId);
    expect(response.workflows).toMatchInlineSnapshot(`
      [
        {
          "id": "email-service.send-email",
          "title": "Send Email",
        },
      ]
    `);
  });

  it('should be able to start a workflow and pick it up', async () => {
    // start a workflow
    userService.on('startWorkflow', (type, context, cb) => {
      started(type);
      cb(partial({ workflowId: '123', prompt }));
    });
    userService.on('pickUpWorkflow', (workflowId, cb) => {
      pickup(workflowId);
      cb(partial({ workflowId: '123', prompt }));
    });

    const response = await io.startWorkflow('user-service.create-user' as WorkflowTypeId, context);
    expect(response).toMatchInlineSnapshot(`
      {
        "prompt": {
          "$type": "message",
          "message": "",
          "severity": "info",
          "title": "name?",
        },
        "workflowId": "user-service.123",
      }
    `);

    // pickup the workflow
    await expect(io.pickUpWorkflow(response.workflowId as WorkflowId)).resolves.toEqual(response);

    // pickup the workflow again
    await expect(io.pickUpWorkflow(response.workflowId as WorkflowId)).resolves.toEqual(response);

    expect(started).toBeCalledTimes(1);
    expect(pickup).toBeCalledTimes(2);
  });

  it('should be able to start a workflow and get the result', async () => {
    // start a workflow
    userService.on('startWorkflow', (type, context, cb) => {
      started(type);
      cb(partial({ workflowId: '123', prompt: partial(prompt) }));
    });
    const response = await io.startWorkflow('user-service.create-user' as WorkflowTypeId, context);
    expect(started).toBeCalledTimes(1);
    expect(started).toBeCalledWith('create-user');
    expect(response).toMatchInlineSnapshot(`
      {
        "prompt": {
          "$type": "message",
          "message": "",
          "severity": "info",
          "title": "name?",
        },
        "workflowId": "user-service.123",
      }
    `);

    // continue the workflow
    userService.on('continueWorkflow', (workflowId, answer, cb) => {
      continued(workflowId, answer);
      cb(partial({ workflowId: '123', prompt }));
    });
    const response2 = await io.continueWorkflow(response.workflowId as WorkflowId, { title: 'John' });
    expect(continued).toBeCalledTimes(1);
    expect(continued).toBeCalledWith('123', { title: 'John' });
    expect(response2).toMatchInlineSnapshot(`
      {
        "prompt": {
          "$type": "message",
          "message": "",
          "severity": "info",
          "title": "name?",
        },
        "workflowId": "user-service.123",
      }
    `);
  });

  it('should be able to run a workflow and not call other instances', async () => {
    // start a workflow
    userService.on('startWorkflow', (type, context, cb) => {
      started(type);
      cb(partial({ workflowId: '123', prompt }));
    });
    userService.on('continueWorkflow', (workflowId, answer, cb) => {
      continued(workflowId, answer);
      cb(partial({ workflowId: '123', prompt }));
    });
    userService2.on('continueWorkflow', (workflowId, answer, cb) => {
      throw new Error('Should not be called');
    });
    const response = await io.startWorkflow('user-service.create-user' as WorkflowTypeId, context);
    expect(started).toBeCalledTimes(1);
    expect(started).toBeCalledWith('create-user');

    // continue the workflow
    const response2 = await io.continueWorkflow(response.workflowId as WorkflowId, { title: 'John' });
    expect(continued).toBeCalledTimes(1);
    expect(continued).toBeCalledWith('123', { title: 'John' });
    expect(response2).toMatchInlineSnapshot(`
      {
        "prompt": {
          "$type": "message",
          "message": "",
          "severity": "info",
          "title": "name?",
        },
        "workflowId": "user-service.123",
      }
    `);
  });

  it('should start a workflow on one instance but not more', async () => {
    // start a workflow
    userService.on('startWorkflow', (type, context, cb) => {
      started(type);
      cb(
        partial({
          workflowId: '123',
          prompt: { $type: 'message', title: 'name?', severity: 'info', message: '' },
        })
      );
    });
    userService2.on('startWorkflow', (type, context, cb) => {
      started(type);
      cb(
        partial({
          workflowId: '456',
          prompt: { $type: 'message', title: 'name?', severity: 'info', message: '' },
        })
      );
    });
    emailService.on('startWorkflow', (type, context, cb) => {
      started(type);
      cb(
        partial({
          workflowId: '789',
          prompt: { $type: 'message', title: 'name?', severity: 'info', message: '' },
        })
      );
    });

    const response = await io.startWorkflow('user-service.create-user' as WorkflowTypeId, context);
    expect(response.workflowId).toMatchInlineSnapshot(`"user-service.123"`);
    expect(started).toBeCalledTimes(1);
    expect(started).toBeCalledWith('create-user');
  });

  afterEach((done) => {
    io.destroy();
    userService.removeAllListeners();
    userService2.removeAllListeners();
    emailService.removeAllListeners();
    httpServer.close(done);
  });
});
