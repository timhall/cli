const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';

export default function cleanError(error: string | Error): { message: string; stack: string } {
  const content = (typeof error === 'string' ? error : error.stack) || 'EMPTY ERROR';
  const message_match = content.match(MESSAGE_REGEXP);

  let message = message_match ? message_match[0] : content;
  const stack = message_match ? content.slice(message.length) : '';

  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }

  return { message, stack };
}
