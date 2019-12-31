interface Commands {
  usage: string;
  description: string;
  run: (argv: string[], help?: string) => Promise<void>;
}

type Subcommand = string | { path: string; description?: string };

export function commands(
  name: string,
  version: string,
  subcommands: { [name: string]: Subcommand }
): Commands {
  const usage = `Usage: ${name} [command] [options]`;
  const description = 'Commands';
  const run = async (argv: string[], help?: string) => {};

  return { usage, description, run };
}

type RunFn = (argv: string[]) => void | Promise<void>;

export async function run(title: string, fn: RunFn): Promise<void>;
export async function run(fn: RunFn): Promise<void>;
export async function run(title: string | RunFn, fn?: RunFn): Promise<void> {
  // TODO
}
