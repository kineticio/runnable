import { ActionViewResponse } from '../../types/response';
import { defer } from '../defer';

export class UIResponder {
  private deferred = defer<ActionViewResponse>();
  private lastResponse: ActionViewResponse | undefined;

  public respond(view: ActionViewResponse): void {
    this.lastResponse = view;
    this.deferred.resolve(view);
  }

  public waitForResponse(): Promise<ActionViewResponse> {
    return this.deferred.promise;
  }

  public getLastResponse(): ActionViewResponse | undefined {
    return this.lastResponse;
  }
}
