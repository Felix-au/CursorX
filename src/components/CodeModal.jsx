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
  const [tab, setTab] = useState(defaultTab);

  const configBlock  = buildConfigBlock(cursor.params, config);
  const configDesc   = buildConfigDesc(cursor.params, config);
  const fullCode     = configBlock + '\n' + cursor.code;

  // Short Prompt: natural-language description only
  const shortPrompt =
`You are implementing a "${cursor.name}" cursor effect for a web project.

Effect: ${cursor.tagline}
Description: ${cursor.description}

Requirements:
${cursor.prompt}

Deliver production-ready, self-contained vanilla JS. No dependencies.`;

  // Detailed Prompt: full technical spec + CONFIG block + code skeleton
  const detailedPrompt =
`You are implementing a "${cursor.name}" cursor effect.

── Effect ──────────────────────────────────────────
Tagline     : ${cursor.tagline}
Description : ${cursor.description}
Technologies: ${cursor.tech?.join(', ') || 'Canvas API, DOM'}

── Full Specification ──────────────────────────────
${cursor.prompt}

── Current Configuration ───────────────────────────
${configDesc}

── Starter Code (use CONFIG object) ────────────────
${configBlock}
${cursor.code}

── Instructions ────────────────────────────────────
1. Wrap as a React component: export default function ${cursor.name.replace(/\s+/g, '')}Cursor({ containerRef, config })
2. Attach all events to containerRef.current (NOT window/document)
3. Use ResizeObserver for canvas sizing
4. Return full cleanup in useEffect return function
5. All visual params must read from the CONFIG / config prop — no hardcoded values
6. Cursor must be fully confined to the container element`;

  /* Config chips shown in both tabs */
  const chips = cursor.params.map(p => {
    const val = config[p.key] ?? p.default;
    return (
      <span key={p.key} className="config-chip">
        {p.type === 'color'
          ? <span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:val, marginRight:4, verticalAlign:'middle' }} />
          : null}
        <strong>{p.label}:</strong> {String(val)}
      </span>
    );
  });

  return (
    <div className="cm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cm-modal">

        {/* ── Header ───────────────────────────────── */}
        <div className="cm-header">
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="modal-tabs">
              <button className={`modal-tab ${tab === 'code'   ? 'active' : ''}`} onClick={() => setTab('code')}>
                &lt;/&gt; Code
              </button>
              <button className={`modal-tab ${tab === 'prompt' ? 'active' : ''}`} onClick={() => setTab('prompt')}>
                ✦ AI Prompt
              </button>
            </div>
            <span style={{ color:'var(--text-2)', fontSize:13 }}>— {cursor.name}</span>
          </div>

          {/* Config chips */}
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', flex:1, justifyContent:'center', padding:'0 16px' }}>
            {chips}
          </div>

          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ── Body ─────────────────────────────────── */}
        <div className="cm-body">

          {tab === 'code' && (
            <CopySection
              label="Implementation Code"
              content={fullCode}
              mono
            />
          )}

          {tab === 'prompt' && (
            <div className="cm-two-pane">
              <CopySection
                label="✦ Prompt"
                content={shortPrompt}
              />
              <CopySection
                label="✦ Detailed Prompt"
                content={detailedPrompt}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
