export type ValidationResponse = string | true;

export type Validator<T> = (value: T) => ValidationResponse;
