# @timhall/cli

## cli({ name, version, subcommands })

Prepare `help`, `version`, and `run` for commands.

```ts
import { cli, commands, run } from '@timhall/cli';
import { name, version } from '../../package.json';

const subcommands = commands({
  init: { run: argv => { /* ... */ }, description: '...' }
  commit: { load: () => import('./example-commit'), description: '...' },
  // ...
});

const example = cli({ name, version, subcommands });

run(name, async () => {
  const argv = process.argv.slice(2);
  await example.run(argv);
});
```

```txt
> example --help
example v(version)

Usage: example <command>

Commands:
  - init    ...
  - commit  ...

example help <command>  Help on <command>
example -v / --version  Show current version

> example -v
(version)

> example help init
(calls init.run with ['--help'])

> example int
ERROR Unknown command "int", did you mean "init"?

Available commands are "init" and "commit".
Try "example help" for more information.

> example commit -m "Add cli"
(calls commit.default with ['-m', 'Add cli'])
```

## commands(subcommands)

Load and run subcommand functions

Example:

```ts
// ./example-commit
export default async function commit(argv: string[]) {
  // ...
}
```

```ts
import { commands } from '@timhall/cli';

const subcommands = commands({
  init: {
    run(argv: string[]) {
      // Define command directly
    },
    description: 'Initialize a new repository'
  },
  commit: {
    // Only load and run commit command if called
    load: () => import('./example-commit'),
    description: 'Commit change to repository'
  }
});

console.log(subcommands.list);
// {
//   init: 'Initialize a new repository',
//   commit: 'Commit change to repository'
// }

async function main() {
  await subcommands.run(['commit', '-m', 'Added cli']);

  // 1. Load ./example-commit
  // 2. Run with ['-m', 'Added cli']
}
```

## run([title], fn)

Run the given function with proper process management and error handling.
