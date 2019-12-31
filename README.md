# @timhall/cli

```ts
const { run, commands } = require('@timhall/cli');
const dedent = require('@timhall/dedent');
const { name, version } = require('../../package.json');

const subcommands = commands(name, version, {
  new: { path: './vba-blocks-new', description: '...' },
  init: { path: './vba-blocks-init', description: '...' }
  // ...
});

const help = `
  vba-blocks v${version}

  ${subcommands.usage}

  ${subcommands.description}

  Visit https://vba-blocks.com to learn more about vba-blocks.
`;

run(name, async () => {
  const argv = process.argv.slice(2);
  await subcommands.run(argv, help);
});
```

## commands(name, version, subcommands)

Prepare `usage`, `description`, and `run` for commands that adds helpers for `--help`, `-h`, and `help` for showing help and `--version` and `-v` to show version.

## run([title], fn)

Run the given function with proper process management and error handling.
