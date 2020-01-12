import { redBright } from '@timhall/ansi-colors';
import { cleanError } from './errors';

type RunFn = () => void | Promise<void>;

export default async function run(title: string, fn: RunFn): Promise<void>;
export default async function run(fn: RunFn): Promise<void>;
export default async function run(title: string | RunFn, fn?: RunFn): Promise<void> {
  try {
    if (typeof title === 'function') {
      fn = title;
    }
    if (typeof title === 'string') {
      process.title = title;
    }

    process.on('unhandledRejection', onError);
    process.on('uncaughtException', onError);

    await fn!();
  } catch (error) {
    onError(error);
  }

  process.exit(0);
}

function onError(error: Error | any) {
  const { message } = cleanError(error);
  console.error(`${redBright('ERROR')} ${message}`);

  process.exit(1);
}
