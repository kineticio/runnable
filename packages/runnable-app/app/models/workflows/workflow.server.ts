import type { ActionRequest, ActionViewResponse } from '../../types/response';
import { mapValues, keyBy } from '../../utils/objects';
import { toOptions } from '../../utils/options';
import { ValidationError } from '../errors';
import { RunnableContext } from '../../api/context';
import { createInput, createMessage, Input } from './InputBuilder';
import { BreadCrumbs } from './bread-crumbs.server';
import { ClientBridge } from './client-bridge.server';
import { validatorForMappedInput } from './validators.server';
import type { Action } from '~/api/actions';
import { FormPromise, InputForm, InputOutput, TableCellValue } from '~/api/io';

export class Workflow {
  public bridge = new ClientBridge();
  public hasFinished = false;
  public breadcrumbs = new BreadCrumbs();

  constructor(public readonly id: string, public readonly name: string, public readonly action: Action) {}

  public start(context: RunnableContext): Promise<ActionViewResponse> {
    // start action in the background
    this.action
      .execute(this.createIO(), context)
      .then(() => {
        this.bridge.askClientQuestion({
          error: null,
          view: {
            $type: 'terminal',
            variant: 'success',
            label: 'Workflow Complete',
          },
        });
      })
      .catch((error) => {
        this.bridge.askClientQuestion({
          error: error.message,
          view: {
            $type: 'terminal',
            variant: 'error',
            label: 'Workflow Failed',
            description: error.message,
          },
        });
      })
      .finally(() => {
        this.hasFinished = true;
      });

    return this.bridge.waitForWorkflowToAskAQuestion();
  }

  public getLastResponse(): Promise<ActionViewResponse | undefined> {
    return this.bridge.waitForWorkflowToAskAQuestion();
  }

  public continue(request: ActionRequest): Promise<ActionViewResponse> {
    this.bridge.consumeResponseFromClient(request.ioResponse);
    return this.bridge.waitForWorkflowToAskAQuestion();
  }

  private createIO(): InputOutput {
    return {
      form: <T extends Record<string, any>>(form: InputForm<any>) => {
        // cancel all previous form promises
        for (const value of Object.values(form)) {
          value.cancel();
          console.log(value.payload);
        }

        const input = createInput({
          $type: 'form',
          form: mapValues(form, (promise) => (promise.payload as Input<any>).form),
        })
          .normalizeAsSingleton<T>()
          .thenMap<T>((response) => {
            return mapValues(response, (value, key) => {
              const subInput = form[key];
              if (!subInput) {
                throw new ValidationError(`Unexpected key ${key.toString()} in response`);
              }
              return (subInput.payload as Input<any>).normalize(value);
            }) as T;
          })
          .validate(validatorForMappedInput(form))
          .formatBreadcrumbs((values) => {
            return Object.entries(values).flatMap(([key, value]) => {
              const subInput = form[key];
              if (!subInput) {
                throw new ValidationError(`Unexpected key ${key} in response`);
              }
              return (subInput.payload as Input<any>).format(value);
            });
          })
          .build();

        return this.asFormPromise<T>(input);
      },
      input: {
        text: (opts) => {
          const input = createInput({ $type: 'input', ...opts })
            .normalizeAsString()
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
        number: (opts) => {
          const input = createInput({ $type: 'input', type: 'number', ...opts })
            .normalizeAsNumber()
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
        boolean: (opts) => {
          const input = createInput({ $type: 'boolean', ...opts })
            .normalizeAsBoolean()
            .formatBreadcrumbs((value) => [{ key: opts.label, value: value.toString() }])
            .build();

          return this.asFormPromise(input);
        },
        color: (opts) => {
          const input = createInput({ $type: 'color', ...opts })
            .normalizeAsString()
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
        imageURL: (opts) => {
          const input = createInput({ $type: 'imageURL', ...opts })
            .normalizeAsString()
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
      },
      select: {
        dropdown: (opts) => {
          const input = createInput({ $type: 'select', display: 'dropdown', ...opts, data: toOptions(opts.data, opts) })
            .normalizeAsString()
            .thenMap((key) => {
              const found = opts.data.find((item) => opts.getValue(item) === key);
              if (!found) {
                throw new ValidationError('Invalid selection');
              }
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value: opts.getLabel(value) }])
            .build();

          return this.asFormPromise(input);
        },
        radio: (opts) => {
          const input = createInput({ $type: 'select', display: 'radio', ...opts, data: toOptions(opts.data, opts) })
            .normalizeAsString()
            .thenMap((key) => {
              const found = opts.data.find((item) => opts.getValue(item) === key);
              if (!found) {
                throw new ValidationError('Invalid selection');
              }
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value: opts.getLabel(value) }])
            .build();

          return this.asFormPromise(input);
        },
        table: (opts) => {
          const input = createInput({
            $type: 'table',
            label: opts.label,
            rows: opts.data.map((item) => ({ key: opts.getValue(item), cells: opts.getColumns(item) })),
            helperText: opts.helperText,
            initialSelection: opts.initialSelection ? [opts.initialSelection] : undefined,
            headers: opts.headers,
            isMultiSelect: false,
          })
            .normalizeAsString()
            .thenMap((key) => {
              const found = opts.data.find((item) => opts.getValue(item) === key);
              if (!found) {
                throw new ValidationError('Invalid selection');
              }
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value: opts.getColumns(value)[0] }])
            .build();

          return this.asFormPromise(input);
        },
      },
      multiSelect: {
        checkbox: (opts) => {
          const input = createInput({
            $type: 'multiSelect',
            display: 'checkbox',
            ...opts,
            data: toOptions(opts.data, opts),
          })
            .normalizeAsArray<string>()
            .thenMap((keys: string[]) => {
              const dataByKey = keyBy(opts.data, opts.getValue);
              const found = keys.map((key) => dataByKey[key]).filter(Boolean);
              if (found.length !== keys.length) {
                throw new ValidationError('Invalid selection');
              }
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((values) => [
              { key: opts.label, value: values.map((value) => opts.getLabel(value)).join(', ') },
            ])
            .build();

          return this.asFormPromise(input);
        },
        dropdown: (opts) => {
          const input = createInput({
            $type: 'multiSelect',
            display: 'dropdown',
            ...opts,
            data: toOptions(opts.data, opts),
          })
            .normalizeAsArray<string>()
            .thenMap((keys: string[]) => {
              const dataByKey = keyBy(opts.data, opts.getValue);
              const found = keys.map((key) => dataByKey[key]).filter(Boolean);
              if (found.length !== keys.length) {
                throw new ValidationError('Invalid selection');
              }
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((values) => [
              { key: opts.label, value: values.map((value) => opts.getLabel(value)).join(', ') },
            ])
            .build();

          return this.asFormPromise(input);
        },
        table: (opts) => {
          const input = createInput({
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
          })
            .normalizeAsArray<string>()
            .thenMap((keys: string[]) => {
              const dataByKey = keyBy(opts.data, opts.getValue);
              const found = keys.map((key) => dataByKey[key]).filter(Boolean);
              if (found.length !== keys.length) {
                throw new ValidationError('Invalid selection');
              }
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((values) => [
              { key: opts.label, value: values.map((value) => opts.getColumns(value)[0]).join(', ') },
            ])
            .build();

          return this.asFormPromise(input);
        },
      },
      message: {
        html: (opts: { dangerouslySetInnerHTML: string }): Promise<void> => {
          return this.handle(
            createMessage({
              $type: 'message',
              variant: 'info',
              dangerouslySetInnerHTML: opts.dangerouslySetInnerHTML,
            })
          );
        },
        info: (opts: { title: string; description: string }): Promise<void> => {
          return this.handle(
            createMessage({
              $type: 'message',
              variant: 'info',
              title: opts.title,
              description: opts.description,
            })
          );
        },
        success: (opts: { title: string; description: string }): Promise<void> => {
          return this.handle(
            createMessage({
              $type: 'message',
              variant: 'success',
              title: opts.title,
              description: opts.description,
            })
          );
        },
        warning: (opts: { title: string; description: string }): Promise<void> => {
          return this.handle(
            createMessage({
              $type: 'message',
              variant: 'warning',
              title: opts.title,
              description: opts.description,
            })
          );
        },
        error: (opts: { title: string; description: string }): Promise<void> => {
          return this.handle(
            createMessage({
              $type: 'message',
              variant: 'error',
              title: opts.title,
              description: opts.description,
            })
          );
        },
        table: (opts: { title: string; rows: TableCellValue[][]; headers: string[] }): Promise<void> => {
          return this.handle(
            createMessage({
              $type: 'message-table',
              title: opts.title,
              headers: opts.headers,
              rows: opts.rows,
            })
          );
        },
      },
    };
  }

  private asFormPromise<T>(input: Input<T>): FormPromise<T> {
    let cancelled = false;

    // wait 1 tick to allow form wrappers to cancel the inner form's promise
    const promise = wait(1).then(() => {
      if (cancelled) {
        return undefined! as T;
      }
      return this.handle(input);
    }) as FormPromise<T>;

    promise.payload = input;
    promise.cancel = () => {
      cancelled = true;
    };

    return promise;
  }

  private async handle<T>(input: Input<T>, error: string | null = null): Promise<T> {
    this.bridge.askClientQuestion({ error: error, view: input.form });

    try {
      // wait for, and normalize response
      const response = await this.bridge.waitForResponseFromClient().then(input.normalize);

      // validate
      const validationResponse = input.validator(response);
      if (typeof validationResponse === 'string') {
        // validation failed, try again
        return this.handle(input, validationResponse);
      }

      // add to breadcrumbs
      this.breadcrumbs.addAll(input.format(response));

      return response;
    } catch (error: any) {
      // catch ValidationErrors thrown by normalize or validate
      // and try again
      if (ValidationError.is(error)) {
        return this.handle(input, error.message);
      }
      throw error;
    }
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
