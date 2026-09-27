import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ code, language = 'javascript', isFix = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`codeblock-container ${isFix ? 'is-fix' : 'is-vuln'}`}>
      <div className="codeblock-header">
        <div className="window-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
          <span className="codeblock-lang">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}`}
          type="button"
        >
          {copied ? '✓ Copied' : '⧉ Copy Code'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '12px 16px',
          fontSize: '12px',
          lineHeight: '1.6',
          background: 'transparent',
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
        }}
        showLineNumbers
        wrapLongLines
      >
        {code || '// No code available'}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;