# 🔐 SecureScan

An AI-powered web vulnerability scanner that analyzes public GitHub repositories for common security issues and suggests fixes using AI.

## 📖 Overview

SecureScan scans JavaScript/JSX files in any public GitHub repository, detects common vulnerability patterns, and uses AI (via the Groq API) to explain each risk and suggest a corrected code snippet. The results are displayed with a visual security score and severity-coded findings.

## ✨ Features

- **GitHub Repository Scanning** — scan any public repo by owner/repo name
- **5 Vulnerability Detection Rules:**
  - Possible XSS (unsafe `innerHTML` usage)
  - Possible SQL Injection (string concatenation in queries)
  - SQL template-literal interpolation (unsanitized `${}` in SQL strings)
  - Unsafe URL protocols (`javascript:`, `data:`)
  - Hardcoded secrets (API keys, passwords, tokens)
  - Dangerous `eval()` usage
- **AI Fix Suggester** — explains why each issue is risky and generates a corrected code snippet
- **Security Score** — a 0–100 score with a visual gauge, based on severity-weighted findings
- **Modern dark-themed UI** with severity-coded finding cards

## 🛠️ Tech Stack

**Backend:** Node.js, Fastify, Octokit (GitHub API), Groq API (AI suggestions)
**Frontend:** React, Vite, Axios, react-syntax-highlighter

## 🚀 Setup & Run Locally

### Prerequisites
- Node.js installed
- A GitHub Personal Access Token ([create one here](https://github.com/settings/tokens))
- A Groq API key ([create one here](https://console.groq.com))

### Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:

GITHUB_TOKEN=your_github_token
GROQ_API_KEY=your_groq_key
PORT=3000


Run the server:
```bash
node index.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the URL shown in the terminal (usually `http://localhost:5173`).

## ⚠️ Known Limitations

- Scans a maximum of 60 JS/JSX files per repository (to stay within API rate limits)
- AI fix suggestions are generated for the first 10 findings only (to limit response time)
- Detection is regex/pattern-based (not full AST parsing), so multi-line SQL queries or highly obfuscated code may not be detected
- Currently supports 5 vulnerability categories — production-grade tools like Snyk or SonarQube cover hundreds of patterns

## 🔮 Future Improvements

- AST-based parsing for more accurate, multi-line detection
- Support for private repositories
- Additional vulnerability categories (CSRF, insecure cookies, path traversal)
- PDF report export
