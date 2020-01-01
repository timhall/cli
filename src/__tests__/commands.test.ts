import dedent from '@timhall/dedent/macro';
import commands, { Commands } from '../commands';

const fixture = {
  a: { command: () => import('../__fixtures__/test-a'), description: 'A ...' },
  b: { command: async () => (await import('../__fixtures__/test-b')).b, description: 'B ...' },
  failing: {
    command: async () => {
      throw new Error('Uh oh.');
    },
    description: 'Failing ...'
  }
};

const name = 'test';
const version = '1.0.0';
const help = dedent`
  test v1.0.0

  Usage: test <command>

  Commands:
    - a        A ...
    - b        B ...
    - failing  Failing ...

  test help <command>  Help on <command>
  test -v / --version  Show current version
`;

describe('help', () => {
  it('should create help from name, version, and descriptions', () => {
    const subcommands = commands(name, version, fixture);
    expect(subcommands.help).toEqual(help);
  });
});

describe('run', () => {
  it('should show help for no argv', async () => {
    const subcommands = commands(name, version, fixture);

    const result = await runSubcommands(subcommands, []);
    expect(result).toEqual(help);
  });

  it('should show version for -v / --version', async () => {
    const subcommands = commands(name, version, fixture);

    const result = await runSubcommands(subcommands, ['--version']);
    expect(result).toEqual(version);

    const shorthand_result = await runSubcommands(subcommands, ['-v']);
    expect(shorthand_result).toEqual(version);
  });

  it('should show help for no command', async () => {
    const subcommands = commands(name, version, fixture);

    const result = await runSubcommands(subcommands, ['--help']);
    expect(result).toEqual(help);
  });

  it('should show help for help with no command', async () => {
    const subcommands = commands(name, version, fixture);

    const result = await runSubcommands(subcommands, ['help']);
    expect(result).toEqual(help);
  });

  it('should handle unknown command', async () => {
    const subcommands = commands(name, version, fixture);

    await expect(runSubcommands(subcommands, ['ab'])).rejects.toThrow(
      new Error(dedent`
        Unknown command "ab", did you mean "a"?

        Available command are "a", "b", "failing".
        Try "test help" for more information.
      `)
    );
  });

  it('should handle command failing to load', async () => {
    const subcommands = commands(name, version, fixture);

    await expect(runSubcommands(subcommands, ['failing'])).rejects.toThrow(
      new Error(dedent`
        Failed to load command "failing".

        Error: Uh oh.
      `)
    );
  });

  it('should run subcommand with argv', async () => {
    const subcommands = commands(name, version, fixture);

    const result = await runSubcommands(subcommands, ['a', '--option', 'value']);
    expect(result).toEqual(`a ["--option","value"]`);
  });

  it('should run help for subcommand', async () => {
    const subcommands = commands(name, version, fixture);

    const result = await runSubcommands(subcommands, ['help', 'b']);
    expect(result).toEqual(`b ["--help"]`);
  });

  it('should allow custom help', async () => {
    const subcommands = commands(name, version, fixture);

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

  await subcommands.run(argv, help);
  const result = spy.mock.calls[0][0] as string;

  spy.mockRestore();

  return result;
}
