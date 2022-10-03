import type { ActionRequest, ActionViewResponse } from '../../types/response';
import { mapValues, keyBy } from '../../utils/objects';
import { toOptions } from '../../utils/options';
import { ValidationError } from '../errors';
import { createInput, Input } from './InputBuilder';
import { BreadCrumbs } from './bread-crumbs.server';
import { ClientBridge } from './client-bridge.server';
import { validatorForMappedInput } from './validators.server';
import type { Action, ActionContext, InputForm, InputOutput } from '~/api/actions';

export class Workflow {
  public bridge = new ClientBridge();
  public hasFinished = false;
  public breadcrumbs = new BreadCrumbs();

  constructor(public readonly id: string, public readonly name: string, public readonly action: Action) {}

  public start(): Promise<ActionViewResponse> {
    // start action in the background
    this.action
      .execute(this.createIO(), this.createContext())
      .then(() => {
        this.bridge.askClientQuestion({
          error: null,
          view: {
            $type: 'success',
            label: 'Workflow Complete',
          },
        });
      })
      .catch((error) => {
        this.bridge.askClientQuestion({
          error: error.message,
          view: {
            $type: 'error',
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

  public async continue(request: ActionRequest): Promise<ActionViewResponse> {
    this.bridge.consumeResponseFromClient(request.ioResponse);
    return await this.bridge.waitForWorkflowToAskAQuestion();
  }

  private createIO(): InputOutput {
    return {
      form: <T extends Record<string, any>>(form: InputForm<any>) => {
        const input = createInput({ $type: 'form', form: mapValues(form, (promise) => promise.payload) })
          .normalizeAsSingleton<T>()
          .validate(validatorForMappedInput(form))
          .formatBreadcrumbs((values) => {
            return Object.entries(values).map(([key, value]) => ({
              key: form[key].payload.label ?? key,
              value,
            }));
          })
          .build();

        return {
          payload: input.form,
          prompt: () => this.handle(input),
        };
      },
      input: {
        text: (opts) => {
          const input = createInput({ $type: 'input', ...opts })
            .normalizeAsString()
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
        },
        number: (opts) => {
          const input = createInput({ $type: 'input', type: 'number', ...opts })
            .normalizeAsNumber()
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
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

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
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

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
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

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
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

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
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

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
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

          return {
            payload: input.form,
            prompt: () => this.handle(input),
          };
        },
      },
    };
  }

  private createContext(): ActionContext {
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

  private async handle<T>(input: Input<T>, error: string | null = null): Promise<T> {
    this.bridge.askClientQuestion({ error: error, view: input.form });

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
  }
}
