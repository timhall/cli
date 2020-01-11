import dedent from '@timhall/dedent/macro';
import cli from '../cli';
import commands, { Commands } from '../commands';

const name = 'test';
const version = '1.0.0';
const help = dedent`
  test v1.0.0

  Usage: test <command>

  Commands:
    - a        A ...
    - b        B ...
    - failing  Failing ...

  test help <command>  Show help for <command>
  test -h, --help      Show usage information
  test -v, --version   Show current version
  `;

const subcommands = commands({
  a: { load: () => import('../__fixtures__/test-a'), description: 'A ...' },
  b: { load: async () => (await import('../__fixtures__/test-b')).b, description: 'B ...' },
  failing: {
    load: async () => {
      throw new Error('Uh oh.');
    },
    description: 'Failing ...'
  }
});

describe('help', () => {
  it('should create help from name, version, and descriptions', () => {
    const test = cli({ name, version, subcommands });
    expect(test.help).toEqual(help);
  });
});

describe('run', () => {
  it('should show help for no argv', async () => {
    const result = await runSubcommands(subcommands, []);
    expect(result).toEqual(help);
  });

  it('should show version for -v / --version', async () => {
    const result = await runSubcommands(subcommands, ['--version']);
    expect(result).toEqual(version);

    const shorthand_result = await runSubcommands(subcommands, ['-v']);
    expect(shorthand_result).toEqual(version);
  });

  it('should show help for no command', async () => {
    const result = await runSubcommands(subcommands, ['--help']);
    expect(result).toEqual(help);
  });

  it('should show help for help with no command', async () => {
    const result = await runSubcommands(subcommands, ['help']);
    expect(result).toEqual(help);
  });

  it('should handle unknown command', async () => {
    await expect(runSubcommands(subcommands, ['ab'])).rejects.toThrow(
      new Error(dedent`
        Unknown command "ab", did you mean "a"?

        Available commands are "a", "b", and "failing".
        Try "test help" for more information.
      `)
    );
  });

  it('should handle command failing to load', async () => {
    await expect(runSubcommands(subcommands, ['failing'])).rejects.toThrow(
      new Error(dedent`
        Failed to load command "failing".

        Error: Uh oh.
      `)
    );
  });

  it('should run subcommand with argv', async () => {
    const result = await runSubcommands(subcommands, ['a', '--option', 'value']);
    expect(result).toEqual(`a ["--option","value"]`);
  });

  it('should run help for subcommand', async () => {
    const result = await runSubcommands(subcommands, ['help', 'b']);
    expect(result).toEqual(`b ["--help"]`);
  });

  it('should allow custom help', async () => {
    const result = await runSubcommands(subcommands, [], 'custom help');
    expect(result).toEqual(`custom help`);
  });
});

async function runSubcommands(
  subcommands: Commands,
  argv: string[],
  help?: string
): Promise<string> {
  const spy = jest.spyOn(global.console, 'log').mockImplementation();
  const test = cli({ name, version, subcommands });

  try {
    await test.run(argv, help);
    const result = spy.mock.calls[0][0] as string;

    return result;
  } catch (error) {
    throw error;
  } finally {
    spy.mockRestore();
  }
}
