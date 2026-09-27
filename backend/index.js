require('dotenv').config();
const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {
  origin: '*',
});

const { scanFile, scanCode, calculateScore } = require('./scanner');
const { getRepoFiles, getFileContent } = require('./githubFetcher');

fastify.get('/', async () => {
  return { status: 'SecureScan backend running' };
});

fastify.post('/scan-local', async (request, reply) => {
  const { filePath } = request.body;
  try {
    const findings = scanFile(filePath);
    return { findings };
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

const { getFixSuggestion } = require('./aifixer');

fastify.post('/scan-repo', async (request, reply) => {
  const { owner, repo } = request.body;

  try {
    const files = await getRepoFiles(owner, repo);
    const limitedFiles = files.slice(0, 60);

    let allFindings = [];

    for (const file of limitedFiles) {
      const content = await getFileContent(owner, repo, file.path);
      const findings = scanCode(content, file.path);
      allFindings = allFindings.concat(findings);
    }

    const limitedFindings = allFindings.slice(0, 10);

    for (const finding of limitedFindings) {
      const aiResult = await getFixSuggestion(finding);
      finding.aiExplanation = aiResult.explanation;
      finding.aiFix = aiResult.fixedCode;
    }
    
    const scoreData = calculateScore(allFindings);

    return {
      repo: `${owner}/${repo}`,
      filesScanned: limitedFiles.length,
      totalFindings: allFindings.length,
      securityScore: scoreData.score,
      criticalCount: scoreData.critical,
      highCount: scoreData.high,
      findings: allFindings,
    };
  } catch (err) {
    reply.code(500).send({ error: err.message });
  }
});

fastify.listen({ port: process.env.PORT || 3000 }, (err) => {
  if (err) throw err;
});