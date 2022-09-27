import type { ActionRequest, ActionViewResponse, IOForm } from '../../types/response';
import type { DeferredPromise } from '../defer';
import { defer } from '../defer';
import type { UIResponder } from './ui-responder.server';
import { BreadCrumbs } from './bread-crumbs.server';
import type { Action, ActionContext, InputForm, InputOutput } from '~/api/actions';

export class Workflow {
  public pendingResponse: DeferredPromise<any> | undefined;
  public uiResponder!: UIResponder;
  public hasFinished = false;
  public error: Error | undefined;
  public breadcrumbs = new BreadCrumbs();

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
      form: <T extends Record<string, any>>(form: InputForm<any>) => {
        const payload: IOForm = {
          $type: 'form',
          form: mapValues(form, (promise) => promise.payload),
        };

        return {
          payload,
          prompt: () =>
            this.prompt<T>(payload)
              .then(getFirstValueAndWarn)
              .then((values) => {
                const displayValues: any = {};
                for (const [key, value] of Object.entries(values)) {
                  displayValues[form[key].payload.label ?? key] = value;
                }
                this.breadcrumbs.addObject(displayValues);
                return values;
              }),
        };
      },
      input: {
        text: (opts) => {
          const payload: IOForm = {
            $type: 'input',
            ...opts,
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then(getFirstValueAndWarn)
                .then((value) => {
                  this.breadcrumbs.add(opts.label, value);
                  return value;
                }),
          };
        },
        number: (opts) => {
          const payload: IOForm = {
            $type: 'input',
            type: 'number',
            ...opts,
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then(getFirstValueAndWarn)
                .then((value) => {
                  this.breadcrumbs.add(opts.label, value);
                  return value;
                })
                .then(Number.parseFloat),
          };
        },
      },
      select: {
        dropdown: (opts) => {
          const payload: IOForm = {
            $type: 'select',
            display: 'dropdown',
            ...opts,
            data: toOptions(opts.data, opts),
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then(getFirstValueAndWarn)
                .then((key) => {
                  const found = opts.data.find((item) => opts.getValue(item) === key);
                  if (!found) {
                    throw new Error('Invalid selection');
                  }
                  return found;
                })
                .then((value) => {
                  this.breadcrumbs.add(opts.label, opts.getLabel(value));
                  return value;
                }),
          };
        },
        radio: (opts) => {
          const payload: IOForm = {
            $type: 'select',
            display: 'radio',
            ...opts,
            data: toOptions(opts.data, opts),
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then(getFirstValueAndWarn)
                .then((key) => {
                  const found = opts.data.find((item) => opts.getValue(item) === key);
                  if (!found) {
                    throw new Error('Invalid selection');
                  }
                  return found;
                })
                .then((value) => {
                  this.breadcrumbs.add(opts.label, opts.getLabel(value));
                  return value;
                }),
          };
        },
        table: (opts) => {
          const payload: IOForm = {
            $type: 'table',
            label: opts.label,
            rows: opts.data.map((item) => ({
              key: opts.getValue(item),
              cells: opts.getColumns(item),
            })),
            helperText: opts.helperText,
            initialSelection: opts.initialSelection ? [opts.initialSelection] : undefined,
            headers: opts.headers,
            isMultiSelect: false,
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then(getFirstValueAndWarn)
                .then((key) => {
                  const found = opts.data.find((item) => opts.getValue(item) === key);
                  if (!found) {
                    throw new Error('Invalid selection');
                  }
                  return found;
                })
                .then((value) => {
                  this.breadcrumbs.add(opts.label, opts.getColumns(value)[0]);
                  return value;
                }),
          };
        },
      },
      multiSelect: {
        checkbox: (opts) => {
          const payload: IOForm = {
            $type: 'multiSelect',
            display: 'checkbox',
            ...opts,
            data: toOptions(opts.data, opts),
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then((keys: string[]) => {
                  const dataByKey = keyBy(opts.data, opts.getValue);
                  const found = keys.map((key) => dataByKey[key]).filter(Boolean);
                  if (found.length !== keys.length) {
                    throw new Error('Invalid selection');
                  }
                  return found;
                })
                .then((values) => {
                  this.breadcrumbs.add(opts.label, values.map((value) => opts.getLabel(value)).join(', '));
                  return values;
                }),
          };
        },
        dropdown: (opts) => {
          const payload: IOForm = {
            $type: 'multiSelect',
            display: 'dropdown',
            ...opts,
            data: toOptions(opts.data, opts),
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then((keys: string[]) => {
                  const dataByKey = keyBy(opts.data, opts.getValue);
                  const found = keys.map((key) => dataByKey[key]).filter(Boolean);
                  if (found.length !== keys.length) {
                    throw new Error('Invalid selection');
                  }
                  return found;
                })
                .then((values) => {
                  this.breadcrumbs.add(opts.label, values.map((value) => opts.getLabel(value)).join(', '));
                  return values;
                }),
          };
        },
        table: (opts) => {
          const payload: IOForm = {
            $type: 'table',
            label: opts.label,
            rows: opts.data.map((item) => ({
              key: opts.getValue(item),
              cells: opts.getColumns(item),
            })),
            helperText: opts.helperText,
            initialSelection: opts.initialSelection,
            headers: opts.headers,
            isMultiSelect: true,
          };
          return {
            payload,
            prompt: () =>
              this.prompt<string>(payload)
                .then((keys: string[]) => {
                  const dataByKey = keyBy(opts.data, opts.getValue);
                  const found = keys.map((key) => dataByKey[key]).filter(Boolean);
                  if (found.length !== keys.length) {
                    throw new Error('Invalid selection');
                  }
                  return found;
                })
                .then((values) => {
                  this.breadcrumbs.add(opts.label, values.map((value) => opts.getColumns(value)[0]).join(', '));
                  return values;
                }),
          };
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

  private prompt<T>(payload: IOForm): Promise<T[]> {
    const deferred = defer<T[]>();
    this.pendingResponse = deferred;
    this.uiResponder.respond({ view: payload });
    return deferred.promise;
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

function mapValues<T extends object, V>(obj: T, fn: (value: T[keyof T], key: keyof T) => V): Record<string, V> {
  const result = {} as Record<string, any>;
  for (const key of Object.keys(obj)) {
    result[key] = fn(obj[key as keyof T], key as keyof T);
  }
  return result;
}

function getFirstValueAndWarn<T>(values: T[] | T): T {
  if (!Array.isArray(values)) {
    return values;
  }
  if (values.length > 1) {
    console.log('Expected single value, but got ' + values.length);
  }
  if (values.length === 0) {
    throw new Error('Missing required field.');
  }
  return values[0];
}
