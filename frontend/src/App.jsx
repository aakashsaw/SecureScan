import { useState } from 'react';
import axios from 'axios';
import './App.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import CodeBlock from './CodeBlock';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);
  const [scoreInfo, setScoreInfo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const parseRepoInput = (input) => {
    const clean = input.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    return null;
  };

  const handleScan = async (e) => {
    e.preventDefault();
    const parsed = parseRepoInput(repoUrl);
    if (!parsed) {
      setError("Couldn't parse repository. Please use 'owner/repo' format (e.g. facebook/react)");
      return;
    }

    setLoading(true);
    setError('');
    setFindings([]);
    setScoreInfo(null);
    setScanned(false);

    try {
      const res = await axios.post(`${API_URL}/scan-repo`,  {
        owner: parsed.owner,
        repo: parsed.repo,
      });
      setFindings(res.data.findings || []);
      setScoreInfo({
        score: res.data.securityScore ?? 0,
        critical: res.data.criticalCount ?? 0,
        high: res.data.highCount ?? 0,
      });
      setScanned(true);
    } catch (err) {
      // Clean custom error handling (no 500 ugly errors)
      if (err.response && (err.response.status === 404 || err.response.status === 500)) {
        setError("Couldn't find your repository. Please check the owner/repository name or ensure it is public.");
      } else {
        setError("Couldn't complete scan. Please verify the repository name and your network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredFindings = findings.filter((f) => {
    if (activeFilter === 'ALL') return true;
    return f.severity?.toUpperCase() === activeFilter;
  });

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="nav-brand">
          <div className="shield-icon">🛡️</div>
          <span className="brand-name">SecureScan <span className="brand-tag">AI</span></span>
        </div>
        <div className="nav-badges">
          <span className="status-pill online">Engine Active</span>
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="scanner-hero">
          <h1 className="hero-title">Automated SAST & AI Remediation Engine</h1>
          <p className="hero-desc">
            <span className="highlight-green">Vulnerability Scanner & Auto-Fix Suggester</span>
            <span className="desc-sub"> — Analyze repositories for SQLi, XSS, insecure patterns, and get instant fixes.</span>
          </p>

          <form className="scan-box" onSubmit={handleScan}>
            <span className="input-prefix">github.com/</span>
            <input
              type="text"
              className="repo-input"
              placeholder="owner/repo (e.g. abc/Project1)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
            />
            <button className="scan-submit-btn" type="submit" disabled={loading || !repoUrl.trim()}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span> Scanning...
                </>
              ) : (
                'Run Security Scan'
              )}
            </button>
          </form>

          {/* Clean Error Display */}
          {error && (
            <div className="banner-alert error-banner">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          {/* Scanning In-Progress Animation */}
          {loading && (
            <div className="scanning-state-box">
              <div className="radar-spinner"></div>
              <p className="scan-loading-text">
                Please wait, your repository is being scanned...
              </p>
              <span className="scan-subtext">Fetching AST tree, evaluating SAST rules & generating AI remediation</span>
            </div>
          )}
        </section>

        {/* Security Metric Cards */}
        {scoreInfo && !loading && (
          <section className="metrics-dashboard">
            <div className="metric-card score-card">
              <span className="metric-title">Security Health Score</span>
              <div className="metric-value-wrapper">
                <span className={`score-number ${scoreInfo.score > 70 ? 'good' : scoreInfo.score > 40 ? 'warn' : 'bad'}`}>
                  {scoreInfo.score}
                </span>
                <span className="score-denom">/ 100</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-fill ${scoreInfo.score > 70 ? 'fill-good' : scoreInfo.score > 40 ? 'fill-warn' : 'fill-bad'}`}
                  style={{ width: `${Math.min(scoreInfo.score, 100)}%` }}
                />
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-title">Critical Flaws</span>
              <div className="metric-value-wrapper">
                <span className="count-number crit-text">{scoreInfo.critical}</span>
                <span className="status-badge crit-badge">Immediate Action</span>
              </div>
              <p className="metric-sub">Remote Code Execution, SQLi, Hardcoded Keys</p>
            </div>

            <div className="metric-card">
              <span className="metric-title">High Vulnerabilities</span>
              <div className="metric-value-wrapper">
                <span className="count-number high-text">{scoreInfo.high}</span>
                <span className="status-badge high-badge">Priority</span>
              </div>
              <p className="metric-sub">Stored XSS, Unsanitized URL Redirects</p>
            </div>
          </section>
        )}

        {/* Findings Toolbar */}
        {findings.length > 0 && !loading && (
          <div className="findings-toolbar">
            <h2 className="section-heading">
              Detected Vulnerabilities <span className="findings-count">({findings.length})</span>
            </h2>
            <div className="filter-group">
              <button
                className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveFilter('ALL')}
              >
                All ({findings.length})
              </button>
              <button
                className={`filter-btn crit ${activeFilter === 'CRITICAL' ? 'active' : ''}`}
                onClick={() => setActiveFilter('CRITICAL')}
              >
                Critical ({findings.filter(f => f.severity?.toUpperCase() === 'CRITICAL').length})
              </button>
              <button
                className={`filter-btn high ${activeFilter === 'HIGH' ? 'active' : ''}`}
                onClick={() => setActiveFilter('HIGH')}
              >
                High ({findings.filter(f => f.severity?.toUpperCase() === 'HIGH').length})
              </button>
            </div>
          </div>
        )}

        {/* Clean State (No Vulnerabilities) */}
        {scanned && !loading && !error && findings.length === 0 && (
          <div className="clean-repo-banner">
            <div className="clean-icon">🛡️</div>
            <h3>Repository Clean</h3>
            <p>No critical or high vulnerabilities detected against standard SAST signatures.</p>
          </div>
        )}

        {/* Vulnerability Cards List */}
        {!loading && (
          <section className="findings-list">
            {filteredFindings.map((f, i) => (
              <article className={`vulnerability-card ${f.severity?.toLowerCase()}`} key={i}>
                <div className="card-topbar">
                  <div className="meta-left">
                    <span className={`severity-tag ${f.severity?.toLowerCase()}`}>{f.severity}</span>
                    <h3 className="issue-title">{f.issue}</h3>
                  </div>
                  <div className="file-locator">
                    <span className="file-icon">📄</span>
                    <code className="file-path">{f.file}</code>
                    <span className="line-tag">Line {f.line}</span>
                  </div>
                </div>

                <div className="card-section">
                  <div className="section-label">
                    <span>🚨 Vulnerable Code Snippet</span>
                  </div>
                  <CodeBlock code={f.code} isFix={false} />
                </div>

                {f.aiExplanation && (
                  <div className="card-section ai-explanation-box">
                    <div className="section-label ai-label">
                      <span>💡 Threat Context & Exploitation Risk</span>
                    </div>
                    <p className="ai-text">{f.aiExplanation}</p>
                  </div>
                )}

                {f.aiFix && (
                  <div className="card-section">
                    <div className="section-label fix-label">
                      <span>🛠️ Suggested Secure Remediation</span>
                    </div>
                    <CodeBlock code={f.aiFix} isFix={true} />
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;