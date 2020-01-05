const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';

export class ErrorCode extends Error {
  public code: string;

  constructor(code: string, message: string) {
    super(message);
    Error.captureStackTrace(this, ErrorCode);

    this.code = code;
  }
}

export function isErrorCode(value: any): value is ErrorCode {
  return value && typeof value.code === 'string';
}

export function editErrorMessage(error: Error, edit: (message: string) => string) {
  const { message, stack } = cleanError(error);
  const edited = edit(message);

  error.message = edited;
  error.stack = edited + stack;
}

export function cleanError(error: string | Error): { message: string; stack: string } {
  const content = (typeof error === 'string' ? error : error.stack) || 'EMPTY ERROR';
  const message_match = content.match(MESSAGE_REGEXP);

  let message = message_match ? message_match[0] : content;
  const stack = message_match ? content.slice(message.length) : '';

  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }

  return { message, stack };
}
