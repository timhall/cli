import dedent from '@timhall/dedent/macro';
import meant from 'meant';
import mri from 'mri';

type RunCommands = (argv: string[], help?: string) => Promise<void>;

export interface Commands {
  help: string;
  run: RunCommands;
}

export type Subcommand = (argv: string[]) => Promise<void>;
type ImportSubcommand = () => Promise<Subcommand | { default: Subcommand }>;
type SubcommandDetails = { command: ImportSubcommand; description?: string };

export interface Subcommands {
  [name: string]: ImportSubcommand | SubcommandDetails;
}
interface StrictSubcommands {
  [name: string]: SubcommandDetails;
}

export default function commands(
  name: string,
  version: string,
  subcommands: Subcommands
): Commands {
  // Simplify subcommands to the same details shape
  const strict_subcommands = Object.entries(subcommands).reduce((memo, [name, details]) => {
    memo[name] = typeof details === 'function' ? { command: details } : details;
    return memo;
  }, {} as StrictSubcommands);

  // Create subcommand list with consistent alignment
  const name_width = Object.keys(subcommands).reduce(
    (memo, name) => Math.max(memo, name.length),
    0
  );
  const subcommand_list = Object.entries(subcommands).map(([name, value]) => {
    const description = typeof value !== 'function' ? value.description : '';

    return `  - ${name.padEnd(name_width + 2)}${description || ''}`;
  });

  // Generate default help that can be extended / overridden in run
  const help = dedent`
    ${name} v${version}

    Usage: ${name} <command>

    Commands:
    ${subcommand_list.join('\n')}

    ${name} help <command>  Help on <command>
    ${name} -v / --version  Show current version
  `;

  const run = generateRun(name, version, strict_subcommands, help);

  return { help, run };
}

function generateRun(
  name: string,
  version: string,
  subcommands: StrictSubcommands,
  default_help: string
): RunCommands {
  return async function run(argv, help = default_help) {
    const args = mri(argv, { alias: { h: 'help', v: 'version' } });
    let [subcommand_name] = args._;

    // <name> -v, --version, or anything else
    if (!subcommand_name) {
      if (args.version) {
        console.log(version);
      } else {
        console.log(help);
      }

      return;
    }

    subcommand_name = subcommand_name.toLowerCase();

    // help [<command>]
    if (subcommand_name === 'help') {
      subcommand_name = args._[1];

      if (!subcommand_name) {
        console.log(help);
        return;
      }

      argv = argv.slice(1).concat('--help');
    }

    // Unknown command
    const available_subcommands = Object.keys(subcommands);
    if (!available_subcommands.includes(subcommand_name)) {
      const approximate = meant(subcommand_name, available_subcommands);
      const did_you_mean = approximate.length ? `, did you mean "${approximate[0]}"?` : '.';

      const available_commands = available_subcommands.map(name => `"${name}"`).join(', ');

      throw new Error(dedent`
        Unknown command "${subcommand_name}"${did_you_mean}

        Available command are ${available_commands}.
        Try "${name} help" for more information.
      `);
    }

    // Load subcommand
    argv = argv.slice(1);
    let subcommand: Subcommand;
    try {
      const result = await subcommands[subcommand_name].command();
      subcommand = typeof result === 'function' ? result : result.default;
    } catch (error) {
      throw new Error(`Failed to load command "${subcommand_name}".\n\n${error}`);
    }

    // Run subcommand
    await subcommand(argv);
  };
}
