import { ActionViewResponse } from '../../types/response';
import { defer, DeferredPromise } from '../defer';
import { ClientFormValue } from './types';

/**
 * Lives on the server-side.
 *
 * Wrapper around client and server communication.
 * Very simple communication with 2 deferred promises, alternating who has the ball-in-their-court.
 */
export class ClientBridge {
  private clientView: DeferredPromise<ActionViewResponse> = defer();
  private clientResponse!: DeferredPromise<ClientFormValue>;

  /**
   * Ask the client a question, send a view.
   */
  public askClientQuestion(view: ActionViewResponse): void {
    // resolve the promise
    this.clientView.resolve(view);
    this.clientResponse = defer();
  }

  /**
   * Consume response from client
   */
  public consumeResponseFromClient(value: ClientFormValue): void {
    // resolve the promise
    this.clientResponse.resolve(value);
    this.clientView = defer();
  }

  /**
   * Promise that resolves when the workflow wants as a question.
   */
  public waitForWorkflowToAskAQuestion(): Promise<ActionViewResponse> {
    return this.clientView.promise;
  }

  /**
   * Promise that resolves when the client responds.
   * If the client has already responded, the promise will resolve immediately.
   */
  public waitForResponseFromClient(): Promise<ClientFormValue> {
    return this.clientResponse.promise;
  }
}
