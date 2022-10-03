export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }

  public static is(err: unknown): err is ValidationError {
    return err instanceof ValidationError;
  }
}
