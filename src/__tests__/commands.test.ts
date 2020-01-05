import dedent from '@timhall/dedent/macro';
import commands, { Commands } from '../commands';

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

const list = dedent`
  Commands:
    - a        A ...
    - b        B ...
    - failing  Failing ...
`;

describe('list', () => {
  it('should create formatted list of commands', () => {
    expect(subcommands.list).toEqual(list);
  });
});

describe('run', () => {
  it('should handle unknown command', async () => {
    await expect(runSubcommands(subcommands, ['ab'])).rejects.toThrow(
      new Error(dedent`
        Unknown command "ab", did you mean "a"?

        Available commands are "a", "b", and "failing".
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
});

async function runSubcommands(subcommands: Commands, argv: string[]): Promise<string> {
  const spy = jest.spyOn(global.console, 'log').mockImplementation();

  await subcommands.run(argv);
  const result = spy.mock.calls[0][0] as string;

  spy.mockRestore();

  return result;
}
