import { InputForm, Validator } from '../../api/actions';
import { Input } from './InputBuilder';

export function validatorForMappedInput<T extends object>(form: InputForm<T>): Validator<T> {
  return (value: T) => {
    const errors: string[] = [];
    for (const key of Object.keys(form)) {
      const castedKey = key as keyof T;
      const field = form[castedKey];
      const input = field.payload as Input<any>;
      if ('validator' in input) {
        const validationResult = input.validator(value[castedKey]);
        if (typeof validationResult === 'string') {
          errors.push(validationResult);
        }
      }
    }
    if (errors.length > 0) {
      return formatAsBullets(errors);
    }
    return true;
  };
}

function formatAsBullets(errors: string[]): string {
  return errors.map((error) => `• ${error}`).join('\n');
}
