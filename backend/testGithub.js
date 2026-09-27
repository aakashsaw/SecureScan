const { getRepoFiles } = require('./githubFetcher');

async function run() {
  const files = await getRepoFiles('expressjs', 'express');
  console.log('Total JS files found:', files.length);
  console.log(files.slice(0, 5)); // sirf pehli 5 files dikhao
}

run();  