declare module '@timhall/cli' {
  type Run = (argv: string[], help?: string) => Promise<void>;
  interface CommandList {
    [name: string]: string;
  }

  export interface Commands {
    list: CommandList;
    run: Run;
  }

  export type Subcommand = (argv: string[]) => Promise<void>;

  type ImportSubcommand = () => Promise<Subcommand | { default: Subcommand }>;
  type SubcommandDetails =
    | { load: ImportSubcommand; run?: undefined; description?: string }
    | { run: Subcommand; load?: undefined; description?: string };

  export interface Subcommands {
    [name: string]: SubcommandDetails;
  }

  export function commands(subcommands: Subcommands): Commands;

  export interface CliOptions {
    name: string;
    version: string;
    subcommands: Commands;
  }

  export interface Cli {
    help: string;
    run: Run;
  }

  export function cli(options: CliOptions): Cli;

  type RunFn = () => void | Promise<void>;

  export function run(title: string, fn: RunFn): Promise<void>;
  export function run(fn: RunFn): Promise<void>;
  export function run(title: string | RunFn, fn?: RunFn): Promise<void>;
}
