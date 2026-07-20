import { useState } from 'react';

/* ── syntax highlighter ─────────────────────────────────── */
const highlight = (code) =>
  code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/[^\n]*)/g, '<span class="tok-cmt">$1</span>')
    .replace(
      /\b(const|let|var|class|new|return|function|if|else|for|forEach|addEventListener|removeEventListener|document|window|Math|Array|requestAnimationFrame|cancelAnimationFrame|setTimeout|clearInterval|setInterval|CONFIG)\b/g,
      '<span class="tok-kw">$1</span>'
    )
    .replace(/`[^`]*`/g, m => `<span class="tok-str">${m}</span>`)
    .replace(/'[^']*'/g, m => `<span class="tok-str">${m}</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');

/* ── helpers ────────────────────────────────────────────── */
const buildConfigBlock = (params, config) => {
  const lines = params.map(p => {
    const val = config[p.key] ?? p.default;
    const v = typeof val === 'string' ? `'${val}'` : val;
    return `  ${p.key}: ${v},  // ${p.label}`;
  }).join('\n');
  return `// ── Your Configuration ─────────────────────────────\nconst CONFIG = {\n${lines}\n};\n\n// ── Implementation ──────────────────────────────────`;
};

const buildConfigDesc = (params, config) =>
  params.map(p => `  • ${p.label}: ${config[p.key] ?? p.default}`).join('\n');

/* ── section with its own scroll + copy btn ─────────────── */
function CopySection({ label, content, mono = false }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="cm-section">
      <div className="cm-section-header">
        <span className="cm-section-label">{label}</span>
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <div className={`cm-section-body ${mono ? 'cm-section-code' : 'cm-section-text'}`}>
        {mono
          ? <div dangerouslySetInnerHTML={{ __html: highlight(content) }} />
          : <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</pre>
        }
      </div>
    </div>
  );
}

/* ── modal ──────────────────────────────────────────────── */
export default function CodeModal({ cursor, config, defaultTab = 'code', onClose }) {
  return null;
}
