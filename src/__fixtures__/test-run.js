const { run } = require('../../lib');

run(async () => {
  const argv = process.argv.slice(2);
  if (argv[0] === '--throw') {
    throw new Error('Uh oh. (throw)');
  } else if (argv[0] === '--reject') {
    new Promise((_resolve, reject) => reject('Uh oh. (reject)'));
    await wait();
  } else {
    console.log(`Success! ${JSON.stringify(argv)}`);
  }
});

async function wait(ms = 1) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
