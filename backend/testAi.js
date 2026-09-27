const { getFixSuggestion } = require('./aifixer');

async function run() {
  const sample = {
    issue: 'Possible XSS',
    severity: 'High',
    file: 'test.js',
    code: 'element.innerHTML = userInput;',
  };

  const result = await getFixSuggestion(sample);
  console.log(result);
}

run();