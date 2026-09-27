const fs = require('fs');

function scanCode(code, fileName = 'unknown') {
  const lines = code.split('\n');
  const findings = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (line.includes('innerHTML')) {
      findings.push({ file: fileName, line: lineNum, issue: 'Possible XSS', severity: 'High', code: trimmed });
    }
    if (line.match(/SELECT.*["'`]\s*\+\s*\w+/) || line.match(/\w+\s*\+\s*["'`].*SELECT/i)) {
      findings.push({ file: fileName, line: lineNum, issue: 'Possible SQL Injection', severity: 'Critical', code: trimmed });
    }
    if (line.match(/\$\{[\w.]+\}/) && /`\s*(SELECT|INSERT|UPDATE|DELETE)\b/i.test(line)) {
      findings.push({ file: fileName, line: lineNum, issue: 'SQL query uses template literal interpolation (verify sanitization)', severity: 'Critical', code: trimmed });
    }
    if (line.match(/(href|src)\s*=\s*[`'"]?\s*\+?\s*(javascript:|data:)/i) || line.includes('javascript:')) {
      findings.push({ file: fileName, line: lineNum, issue: 'Unsafe URL Protocol', severity: 'High', code: trimmed });
    }
    if (line.match(/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{6,}['"]/i)) {
      findings.push({ file: fileName, line: lineNum, issue: 'Hardcoded Secret', severity: 'Critical', code: trimmed });
    }
    if (line.match(/(?<![\w.])eval\s*\(/)) {
  findings.push({ file: fileName, line: lineNum, issue: 'Dangerous eval() usage', severity: 'High', code: trimmed });
    }
  });

  return findings;
}

function scanFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  return scanCode(code, filePath);
}

function calculateScore(findings) {
  let deduction = 0;

  findings.forEach((f) => {
    if (f.severity === 'Critical') deduction += 8;
    else if (f.severity === 'High') deduction += 4;
    else deduction += 2;
  });

  const score = Math.max(0, 100 - deduction);

  const critical = findings.filter((f) => f.severity === 'Critical').length;
  const high = findings.filter((f) => f.severity === 'High').length;

  return { score, critical, high, total: findings.length };
}

module.exports = { scanFile, scanCode, calculateScore };
