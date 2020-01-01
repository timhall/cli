const { promisify } = require('util');
const { join } = require('path');
const execFile = promisify(require('child_process').execFile);

it('should run normally', async () => {
  const { stdout, stderr, error } = await exec([]);

  expect(stdout).toEqual('Success! []\n');
  expect(stderr).toEqual('');
  expect(error).toEqual(undefined);
});

it('should handle errors', async () => {
  const { stdout, stderr, error } = await exec(['--throw']);

  expect(stdout).toEqual('');
  expect(stderr).toEqual('');
  expect(error.message.toString()).toMatch(/throw/g);
});

it('should handle rejections', async () => {
  const { stdout, stderr, error } = await exec(['--reject']);

  expect(stdout).toEqual('');
  expect(stderr).toEqual('');
  expect(error.message.toString()).toMatch(/reject/g);
});

async function exec(argv: string[]): Promise<{ stdout: string; stderr: string; error: Error }> {
  try {
    return await execFile('node', [join(__dirname, '../', '__fixtures__', 'test-run.js'), ...argv]);
  } catch (error) {
    return { stdout: '', stderr: '', error };
  }
}
