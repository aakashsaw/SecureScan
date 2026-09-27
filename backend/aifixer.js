const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getFixSuggestion(finding) {
  const prompt = `You are a security expert. A code scanner found this issue:

Issue: ${finding.issue}
Severity: ${finding.severity}
File: ${finding.file}
Code: ${finding.code}

In 2-3 short sentences, explain WHY this is risky, then give a corrected code snippet. Format your response as JSON only, no markdown, no backticks:
{
  "explanation": "...",
  "fixedCode": "..."
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b',
    });

    const text = completion.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('AI ERROR:', err.message);
    return { explanation: 'AI suggestion unavailable', fixedCode: '' };
  }
}

module.exports = { getFixSuggestion };