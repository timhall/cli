import dedent from '@timhall/dedent/macro';
import { ErrorCode } from './errors';

export interface CommandList {
  [name: string]: string;
}
export type Run = (argv: string[], help?: string) => Promise<void>;

export interface Commands {
  list: CommandList;
  run: Run;
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
  const list: CommandList = {};
  for (const [name, value] of Object.entries(subcommands)) {
    list[name] = value.description || '';
  }

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
      type Meant = (value: string, possible: string[]) => string[];
      const __default = (exports: any) => ('default' in exports ? exports.default : exports);

      const meant = __default(await import('meant')) as Meant;

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

function quoted(value: string): string {
  return `"${value}"`;
}

function commaList(values: string[]): string {
  if (values.length < 3) return values.join(' and ');

  const comma_separated = values.slice(0, values.length - 1);
  const last = values[values.length - 1];

  return `${comma_separated.join(', ')}, and ${last}`;
}
