declare module '@timhall/cli' {
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

  export function commands(name: string, version: string, subcommands: Subcommands): Commands;

  type RunFn = () => void | Promise<void>;

  export function run(title: string, fn: RunFn): Promise<void>;
  export function run(fn: RunFn): Promise<void>;
  export function run(title: string | RunFn, fn?: RunFn): Promise<void>;
}
