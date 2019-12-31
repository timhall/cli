type RunFn = (argv: string[]) => void | Promise<void>;

export default async function run(title: string, fn: RunFn): Promise<void>;
export default async function run(fn: RunFn): Promise<void>;
export default async function run(title: string | RunFn, fn?: RunFn): Promise<void> {
  // TODO
}
