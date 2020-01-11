import dedent from '@timhall/dedent/macro';
import mri from 'mri';
import { Commands, Run } from './commands';
import { editErrorMessage, isErrorCode } from './errors';

interface CliOptions {
  name: string;
  version: string;
  subcommands: Commands;
}

interface Cli {
  help: string;
  run: Run;
}

export default function cli(options: CliOptions): Cli {
  const { name, version, subcommands } = options;

  // Generate default help that can be extended / overridden in run
  const help = dedent`
    ${name} v${version}

    Usage: ${name} <command>

    ${commandList(subcommands.list)}

    ${name} help <command>  Show help for <command>
    ${name} -h, --help      Show usage information
    ${name} -v, --version   Show current version
  `;

  const run = generateRun(name, version, subcommands, help);

  return { help, run };
}

function generateRun(
  name: string,
  version: string,
  subcommands: Commands,
  default_help: string
): Run {
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

    // Remove subcommand name from argv and run
    try {
      await subcommands.run(argv);
    } catch (error) {
      if (isErrorCode(error) && error.code === 'unknown-command') {
        editErrorMessage(
          error,
          message => (message += `\nTry "${name} help" for more information.`)
        );
      }

      throw error;
    }
  };
}

function commandList(commands: { [name: string]: string }): string {
  // Create subcommand list with consistent alignment
  const name_width = Object.keys(commands)
    .map(name => name.length)
    .reduce(max);

  const subcommand_list = Object.entries(commands).map(
    ([name, description]) => `  - ${name.padEnd(name_width + 2)}${description || ''}`
  );

  // Generate default help that can be extended / overridden in run
  const list = dedent`
    Commands:
    ${subcommand_list.join('\n')}
  `;

  return list;
}

function max(current = 0, value: number): number {
  return Math.max(current, value);
}
