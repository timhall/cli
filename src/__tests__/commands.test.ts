import commands from '../commands';

it('should create usage from name', () => {
  const subcommands = commands('test', 'version', {});
  expect(subcommands.usage).toEqual('Usage: test [command] [options]');
});
