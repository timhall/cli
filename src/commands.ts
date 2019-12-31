interface Commands {
  usage: string;
  description: string;
  run: (argv: string[], help?: string) => Promise<void>;
}

type Subcommand = string | { path: string; description?: string };

export default function commands(
  name: string,
  version: string,
  subcommands: { [name: string]: Subcommand }
): Commands {
  const usage = `Usage: ${name} [command] [options]`;
  const description = 'Commands';
  const run = async (argv: string[], help?: string) => {};

  return { usage, description, run };
}
