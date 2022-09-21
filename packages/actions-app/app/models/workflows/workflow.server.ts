import type { ActionRequest, ActionViewResponse } from '../../types/response';
import type { DeferredPromise } from '../defer';
import { defer } from '../defer';
import type { UIResponder } from './ui-responder.server';
import type { Action, ActionContext, InputOutput } from '~/api/actions';

export class Workflow {
  public pendingResponse: DeferredPromise<any> | undefined;
  public uiResponder!: UIResponder;
  public hasFinished = false;
  public error: Error | undefined;

  constructor(public readonly id: string, public readonly name: string, public readonly action: Action) {}

  public start(uiResponder: UIResponder): void {
    this.uiResponder = uiResponder;
    // start action in the background
    this.action
      .execute(this.createIO(), this.createContext())
      .then(() => {
        this.hasFinished = true;
        this.uiResponder.respond({
          view: {
            $type: 'success',
            label: 'Workflow Complete',
          },
        });
      })
      .catch((error) => {
        this.hasFinished = true;
        this.error = error;
        this.uiResponder.respond({
          view: {
            $type: 'error',
            label: 'Workflow Failed',
            description: error.message,
          },
        });
      });
  }

  public getLastResponse(): ActionViewResponse | undefined {
    if (this.hasFinished) {
      if (this.error) {
        return {
          view: {
            $type: 'error',
            label: 'Workflow Failed',
            description: this.error.message,
          },
        };
      }

      return {
        view: {
          $type: 'success',
          label: 'Workflow Complete',
        },
      };
    }

    return this.uiResponder.getLastResponse();
  }

  public continue(uiResponder: UIResponder, request: ActionRequest): void {
    if (!this.pendingResponse) {
      throw new Error('No pending response');
    }
    this.uiResponder = uiResponder;
    this.pendingResponse.resolve(request.ioResponse);
  }

  public createIO(): InputOutput {
    return {
      input: {
        text: (opts) => {
          const deferred = defer<string>();
          this.uiResponder.respond({
            view: {
              $type: 'input',
              ...opts,
            },
          });
          this.pendingResponse = deferred;
          return deferred.promise;
        },
        number: (opts) => {
          const deferred = defer<number>();
          this.uiResponder.respond({
            view: {
              $type: 'input',
              type: 'number',
              ...opts,
            },
          });
          this.pendingResponse = deferred;
          return deferred.promise;
        },
      },
      select: {
        dropdown: (opts) => {
          const deferred = defer<any>();
          this.uiResponder.respond({
            view: {
              $type: 'select',
              display: 'dropdown',
              ...opts,
              data: toOptions(opts.data, opts),
            },
          });
          this.pendingResponse = deferred;
          return deferred.promise.then((key) => {
            const found = opts.data.find((item) => opts.getValue(item) === key);
            if (!found) {
              throw new Error('Invalid selection');
            }
            return found;
          });
        },
        radio: (opts) => {
          const deferred = defer<any>();
          this.uiResponder.respond({
            view: {
              $type: 'select',
              display: 'radio',
              ...opts,
              data: toOptions(opts.data, opts),
            },
          });
          this.pendingResponse = deferred;
          return deferred.promise.then((key) => {
            const found = opts.data.find((item) => opts.getValue(item) === key);
            if (!found) {
              throw new Error('Invalid selection');
            }
            return found;
          });
        },
      },
      multiSelect: {
        checkbox: (opts) => {
          const deferred = defer<any[]>();
          this.uiResponder.respond({
            view: {
              $type: 'multiSelect',
              display: 'checkbox',
              ...opts,
              data: toOptions(opts.data, opts),
            },
          });
          this.pendingResponse = deferred;
          return deferred.promise.then((keys) => {
            const dataByKey = keyBy(opts.data, opts.getValue);
            const found = keys.map((key) => dataByKey[key]).filter(Boolean);
            if (found.length !== keys.length) {
              throw new Error('Invalid selection');
            }
            return found;
          });
        },
        dropdown: (opts) => {
          const deferred = defer<any[]>();
          this.uiResponder.respond({
            view: {
              $type: 'multiSelect',
              display: 'dropdown',
              ...opts,
              data: toOptions(opts.data, opts),
            },
          });
          this.pendingResponse = deferred;
          return deferred.promise.then((keys) => {
            const dataByKey = keyBy(opts.data, opts.getValue);
            const found = keys.map((key) => dataByKey[key]).filter(Boolean);
            if (found.length !== keys.length) {
              throw new Error('Invalid selection');
            }
            return found;
          });
        },
      },
    };
  }

  public createContext(): ActionContext {
    return {
      loading: {
        start(opts: { label: string; length: number }): void {
          return;
        },
        completeOne(): void {
          return;
        },
        complete(number: string): void {
          return;
        },
      },
      message: {
        info(opts: { message: string }): Promise<void> {
          return Promise.resolve();
        },
        success(opts: { message: string }): Promise<void> {
          return Promise.resolve();
        },
      },
    };
  }
}

function keyBy<T>(arr: T[], getKey: (item: T) => string): Record<string, T> {
  const result = {} as Record<string, T>;
  for (const item of arr) {
    result[getKey(item)] = item;
  }
  return result;
}

function toOptions<T>(arr: T[], opts: { getValue: (item: T) => string; getLabel: (item: T) => string }) {
  return arr.map((item) => ({
    label: opts.getLabel(item),
    value: opts.getValue(item),
  }));
}
