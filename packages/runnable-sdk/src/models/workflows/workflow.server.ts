import { TableCellValue, WorkflowPromptFormField } from '@runnablejs/api';
import type { ClientResponse } from '../../types/response';
import { mapValues, keyBy } from '../../utils/objects';
import { toOptions } from '../../utils/options';
import { ValidationError } from '../errors';
import { RunnableContext } from '../../api/context';
import { InputForm, FormPromise } from '../../api/io';
import { InputOutput } from '../../types';
import { RunnableWorkflow } from '../../api/workflows';
import { createInput, createMessage, Input } from './InputBuilder';
import { BreadCrumbs } from './bread-crumbs.server';
import { ClientBridge } from './client-bridge.server';
import { validatorForMappedInput } from './validators.server';
import { WorkflowResponseView } from './types';

export class Workflow {
  public bridge = new ClientBridge();
  public hasFinished = false;
  public breadcrumbs = new BreadCrumbs();

  constructor(public readonly id: string, public readonly name: string, public readonly action: RunnableWorkflow) {}

  public start(context: RunnableContext): Promise<WorkflowResponseView> {
    // start action in the background
    this.action
      .execute(this.createIO(), context)
      .then(() => {
        this.bridge.askClientQuestion({
          error: undefined,
          prompt: {
            $type: 'terminal',
            severity: 'success',
            title: 'Workflow Complete',
            message: '',
          },
        });
      })
      .catch((error) => {
        this.bridge.askClientQuestion({
          error: error.message,
          prompt: {
            $type: 'terminal',
            severity: 'error',
            title: 'Workflow Failed',
            message: error.message,
          },
        });
      })
      .finally(() => {
        this.hasFinished = true;
      });

    return this.bridge.waitForWorkflowToAskAQuestion();
  }

  public getLastResponse(): Promise<WorkflowResponseView | undefined> {
    return this.bridge.waitForWorkflowToAskAQuestion();
  }

  public continue(request: ClientResponse): Promise<WorkflowResponseView> {
    this.bridge.consumeResponseFromClient(request.ioResponse);
    return this.bridge.waitForWorkflowToAskAQuestion();
  }

  private createIO(): InputOutput {
    return {
      form: <T extends Record<string, any>>(form: InputForm<any>) => {
        // cancel all previous form promises
        for (const value of Object.values(form)) {
          value.cancel();
        }

        const input = createInput({
          $type: 'form',
          fields: mapValues(form, (promise) => promise.payload.form as WorkflowPromptFormField),
        })
          .normalizeAsSingleton<T>()
          .thenMap<T>((response) => {
            return mapValues(form, (subInput, key) => {
              const value = response[key as string];
              return subInput.payload.normalize(value);
            }) as T;
          })
          .validate(validatorForMappedInput(form))
          .formatBreadcrumbs((values) => {
            return Object.entries(form).flatMap(([key, subInput]) => {
              const value = values[key];
              return subInput.payload.format(value);
            });
          })
          .build();

        return this.asFormPromise<T>(input);
      },
      hstack: <T extends any[]>(...forms: FormPromise<T>[]) => {
        // cancel all previous form promises
        for (const form of forms) {
          form.cancel();
        }

        const input = createInput({
          $type: 'stack',
          direction: 'horizontal',
          items: forms.map((form) => form.payload.form as WorkflowPromptFormField),
        })
          .normalizeAsArray<T>()
          .thenMap<T>((response) => {
            return forms.map((subInput, index) => {
              const value = response[index];
              return subInput.payload.normalize(value);
            }) as T;
          })
          .validate(validatorForMappedInput(keyBy(forms, (_, index) => index) as any as T))
          .formatBreadcrumbs((values) => {
            return forms.flatMap((subInput, index) => {
              const value = values[index];
              return subInput.payload.format(value);
            });
          })
          .build();

        return this.asFormPromise<T>(input);
      },
      vstack: <T extends any[]>(...forms: FormPromise<T>[]) => {
        // cancel all previous form promises
        for (const form of forms) {
          form.cancel();
        }

        const input = createInput({
          $type: 'stack',
          direction: 'vertical',
          items: forms.map((form) => form.payload.form as WorkflowPromptFormField),
        })
          .normalizeAsArray<T>()
          .thenMap<T>((response) => {
            return forms.map((subInput, index) => {
              const value = response[index];
              return subInput.payload.normalize(value);
            }) as T;
          })
          .validate(validatorForMappedInput(keyBy(forms, (_, index) => index) as any as T))
          .formatBreadcrumbs((values) => {
            return forms.flatMap((subInput, index) => {
              const value = values[index];
              return subInput.payload.format(value);
            });
          })
          .build();

        return this.asFormPromise<T>(input);
      },
      input: {
        text: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.defaultValue,
            optional: opts.optional,
            input: {
              $type: 'text',
            },
          })
            .normalizeAsString()
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
        number: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.defaultValue,
            optional: opts.optional,
            input: {
              $type: 'number',
            },
          })
            .normalizeAsNumber()
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
        boolean: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.defaultValue,
            optional: opts.optional,
            input: {
              $type: 'boolean',
            },
          })
            .normalizeAsBoolean()
            .formatBreadcrumbs((value) => [{ key: opts.label, value: value.toString() }])
            .build();

          return this.asFormPromise(input);
        },
        color: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.defaultValue,
            optional: opts.optional,
            input: {
              $type: 'color',
            },
          })
            .normalizeAsString()
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
        imageURL: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.defaultValue,
            optional: opts.optional,
            input: {
              $type: 'image',
            },
          })
            .normalizeAsString()
            .formatBreadcrumbs((value) => [{ key: opts.label, value }])
            .build();

          return this.asFormPromise(input);
        },
      },
      select: {
        dropdown: (opts) => {
          const options = toOptions(opts.data, opts);
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.initialSelection ?? options[0].value,
            optional: opts.optional,
            input: {
              $type: 'select',
              display: 'dropdown',
              options: options,
            },
          })
            .normalizeAsString()
            .thenMap((key) => {
              const found = opts.data.find((item) => opts.getValue(item) === key);
              assertExists(found);
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value: opts.getLabel(value) }])
            .build();

          return this.asFormPromise(input);
        },
        radio: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            defaultValue: opts.initialSelection,
            optional: opts.optional,
            input: {
              $type: 'select',
              display: 'radio',
              ...opts,
              options: toOptions(opts.data, opts),
            },
          })
            .normalizeAsString()
            .thenMap((key) => {
              const found = opts.data.find((item) => opts.getValue(item) === key);
              assertExists(found);
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [{ key: opts.label, value: opts.getLabel(value) }])
            .build();

          return this.asFormPromise(input);
        },
        table: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            optional: opts.optional,
            defaultValue: opts.initialSelection ? [opts.initialSelection] : undefined,
            input: {
              $type: 'table',
              rows: opts.data.map((item) => ({ key: opts.getValue(item), cells: opts.getColumns(item) as any })),
              headers: opts.headers,
              isMultiSelect: false,
            },
          })
            .normalizeAsString()
            .thenMap((key) => {
              const found = opts.data.find((item) => opts.getValue(item) === key);
              assertExists(found);
              return found;
            })
            .validate(opts.validation)
            .formatBreadcrumbs((value) => [
              {
                key: opts.label,
                value:
                  opts
                    .getColumns(value)
                    .find((v) => typeof v === 'string')
                    ?.toString() ||
                  opts.getColumns(value)[0]?.toString() ||
                  '',
              },
            ])
            .build();

          return this.asFormPromise(input);
        },
      },
      multiSelect: {
        checkbox: (opts) => {
          const input = createInput({
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            optional: opts.optional,
            defaultValue: opts.initialSelection ?? [],
            input: {
              $type: 'multi-select',
              display: 'checkbox',
              options: toOptions(opts.data, opts),
            },
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
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            optional: opts.optional,
            defaultValue: opts.initialSelection ?? [],
            input: {
              $type: 'multi-select',
              display: 'dropdown',
              options: toOptions(opts.data, opts),
            },
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
            $type: 'form-field',
            label: opts.label,
            helperText: opts.helperText,
            placeholder: opts.placeholder,
            optional: opts.optional,
            defaultValue: opts.initialSelection ?? [],
            input: {
              $type: 'table',
              rows: opts.data.map((item) => ({
                key: opts.getValue(item),
                cells: opts.getColumns(item) as any,
              })),
              headers: opts.headers,
              isMultiSelect: true,
            },
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
        html: (opts: { dangerouslySetInnerHTML: string }): FormPromise<void> => {
          return this.asFormPromise(
            createMessage({
              $type: 'message',
              severity: 'info',
              dangerouslySetInnerHTML: true,
              title: '',
              message: opts.dangerouslySetInnerHTML,
            })
          );
        },
        info: (opts: { title: string; message: string }): FormPromise<void> => {
          return this.asFormPromise(
            createMessage({
              $type: 'message',
              severity: 'info',
              title: opts.title,
              message: opts.message,
            })
          );
        },
        success: (opts: { title: string; message: string }): FormPromise<void> => {
          return this.asFormPromise(
            createMessage({
              $type: 'message',
              severity: 'success',
              title: opts.title,
              message: opts.message,
            })
          );
        },
        warning: (opts: { title: string; message: string }): FormPromise<void> => {
          return this.asFormPromise(
            createMessage({
              $type: 'message',
              severity: 'warning',
              title: opts.title,
              message: opts.message,
            })
          );
        },
        error: (opts: { title: string; message: string }): FormPromise<void> => {
          return this.asFormPromise(
            createMessage({
              $type: 'message',
              severity: 'error',
              title: opts.title,
              message: opts.message,
            })
          );
        },
        table: (opts: { title: string; rows: TableCellValue[][]; headers: string[] }): FormPromise<void> => {
          return this.asFormPromise(
            createMessage({
              $type: 'table',
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

  private async handle<T>(input: Input<T>, error?: string | undefined): Promise<T> {
    this.bridge.askClientQuestion({ error: error, prompt: input.form });

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

function assertExists<T>(value: T | undefined | null): asserts value is T {
  if (value == null) {
    throw new ValidationError('Invalid selection');
  }
}
