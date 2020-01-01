# @timhall/cli

```ts
const { run, commands } = require('@timhall/cli');
const { name, version } = require('../../package.json');

const subcommands = commands(name, version, {
  new: { command: () => import('./example-new'), description: '...' },
  init: { command: () => import('./example-init'), description: '...' }
  // ...
});

run(name, async () => {
  const argv = process.argv.slice(2);
  await subcommands.run(argv);
});
```

## commands(name, version, subcommands)

Prepare `help`, `version`, and `run` for commands.

## run([title], fn)

Run the given function with proper process management and error handling.
