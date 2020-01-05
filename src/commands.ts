import dedent from '@timhall/dedent/macro';
import meant from 'meant';
import { ErrorCode } from './errors';

export type Run = (argv: string[], help?: string) => Promise<void>;

export interface Commands {
  list: string;
  run: (argv: string[]) => Promise<void>;
}

export type Subcommand = (argv: string[]) => Promise<void>;
type LoadSubcommand = () => Promise<Subcommand | { default: Subcommand }>;
type SubcommandDetails =
  | { load: LoadSubcommand; run?: undefined; description?: string }
  | { run: Subcommand; load?: undefined; description?: string };

export interface Subcommands {
  [name: string]: SubcommandDetails;
}

export default function commands(subcommands: Subcommands): Commands {
  // Create subcommand list with consistent alignment
  const name_width = Object.keys(subcommands)
    .map(name => name.length)
    .reduce(max);

  const subcommand_list = Object.entries(subcommands).map(
    ([name, value]) => `  - ${name.padEnd(name_width + 2)}${value.description || ''}`
  );

  // Generate default help that can be extended / overridden in run
  const list = dedent`
    Commands:
    ${subcommand_list.join('\n')}
  `;

  const run = generateRun(subcommands);

  return { list, run };
}

function generateRun(subcommands: Subcommands): Run {
  return async function run(argv) {
    let subcommand_name = argv[0];
    subcommand_name = subcommand_name && subcommand_name.toLowerCase();

    // Unknown command
    const available_subcommands = Object.keys(subcommands);
    if (!subcommand_name || !available_subcommands.includes(subcommand_name)) {
      const approximate = meant(subcommand_name, available_subcommands);
      const did_you_mean = approximate.length ? `, did you mean "${approximate[0]}"?` : '.';

      throw new ErrorCode(
        'unknown-command',
        dedent`
          Unknown command "${subcommand_name}"${did_you_mean}

          Available commands are ${commaList(available_subcommands.map(quoted))}.
        `
      );
    }

    // Load subcommand
    let subcommand: Subcommand;
    try {
      const details = subcommands[subcommand_name];
      if (isLoad(details)) {
        const result = await details.load();
        subcommand = typeof result === 'function' ? result : result.default;
      } else {
        subcommand = details.run;
      }
    } catch (error) {
      throw new ErrorCode(
        'failed-to-load',
        `Failed to load command "${subcommand_name}".\n\n${error}`
      );
    }

    // Remove subcommand name from argv and run
    argv = argv.slice(1);
    await subcommand(argv);
  };
}

function isLoad(
  details: SubcommandDetails
): details is { load: LoadSubcommand; run?: undefined; description?: string } {
  return typeof details.load === 'function';
}

function max(current = 0, value: number): number {
  return Math.max(current, value);
}

function quoted(value: string): string {
  return `"${value}"`;
}

function commaList(values: string[]): string {
  if (values.length < 3) return values.join(' and ');

  const comma_separated = values.slice(0, values.length - 1);
  const last = values[values.length - 1];

  return `${comma_separated.join(', ')}, and ${last}`;
}
