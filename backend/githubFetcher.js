const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Recursively saari files ki list laata hai (poore repo ka tree)
async function getRepoFiles(owner, repo) {
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: 'HEAD',
    recursive: 'true',
  });

  // Sirf .js aur .jsx files chahiye abhi
  return data.tree.filter(
    (item) => item.type === 'blob' && (item.path.endsWith('.js') || item.path.endsWith('.jsx'))
  );
}

// Ek file ka actual content laata hai
async function getFileContent(owner, repo, path) {
  const { data } = await octokit.repos.getContent({ owner, repo, path });
  // GitHub content base64 me deta hai, usse decode karna padta hai
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

module.exports = { getRepoFiles, getFileContent };