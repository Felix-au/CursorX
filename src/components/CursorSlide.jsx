import { useState, useRef, useCallback, useEffect } from 'react';
import CodeModal from './CodeModal.jsx';

import MagneticCursor from '../cursors/MagneticCursor.jsx';
import ParticleTrailCursor from '../cursors/ParticleTrailCursor.jsx';
import SpotlightCursor from '../cursors/SpotlightCursor.jsx';
import MorphingBlobCursor from '../cursors/MorphingBlobCursor.jsx';
import PixelShatterCursor from '../cursors/PixelShatterCursor.jsx';
import ElasticRingCursor from '../cursors/ElasticRingCursor.jsx';
import NeonGlowCursor from '../cursors/NeonGlowCursor.jsx';
import TextOrbiterCursor from '../cursors/TextOrbiterCursor.jsx';
import GravityPullCursor from '../cursors/GravityPullCursor.jsx';
import ConstellationCursor from '../cursors/ConstellationCursor.jsx';
import FireTrailCursor from '../cursors/FireTrailCursor.jsx';
import CrosshairScopeCursor from '../cursors/CrosshairScopeCursor.jsx';
import MirrorGhostCursor from '../cursors/MirrorGhostCursor.jsx';
import RainbowCometCursor from '../cursors/RainbowCometCursor.jsx';
import BubbleFloatCursor from '../cursors/BubbleFloatCursor.jsx';
import RippleWaveCursor from '../cursors/RippleWaveCursor.jsx';
import GlitchShiftCursor from '../cursors/GlitchShiftCursor.jsx';
import WindStreamCursor from '../cursors/WindStreamCursor.jsx';
import DNAHelixCursor from '../cursors/DNAHelixCursor.jsx';
import TorchLightCursor from '../cursors/TorchLightCursor.jsx';
import DifferenceBlendCursor from '../cursors/DifferenceBlendCursor.jsx';
import GhostTrailCursor from '../cursors/GhostTrailCursor.jsx';
import AudioPulseCursor from '../cursors/AudioPulseCursor.jsx';

const CURSOR_COMPONENTS = [
  MagneticCursor, ParticleTrailCursor, SpotlightCursor, MorphingBlobCursor,
  PixelShatterCursor, ElasticRingCursor, NeonGlowCursor, TextOrbiterCursor,
  GravityPullCursor, ConstellationCursor, FireTrailCursor,
  CrosshairScopeCursor, MirrorGhostCursor, RainbowCometCursor, BubbleFloatCursor,
  RippleWaveCursor, GlitchShiftCursor, WindStreamCursor, DNAHelixCursor, TorchLightCursor,
  DifferenceBlendCursor, GhostTrailCursor, AudioPulseCursor,
];

const HINTS = {
  1:  '🧲 Hover the demo buttons — feel the pull',
  7:  '🌈 Click inside preview to cycle through 5 neon colors',
  9:  '⚡ Move over the buttons — gravity attracts them',
  12: '🎯 Click inside preview to lock on target',
  16: '💧 Click inside preview to create ripples',
  17: '⚡ Glitch bursts fire automatically every ~2 seconds',
  20: '🕯 The light flickers and lags — navigate the dark',
  21: '🌓 Hover elements and watch them invert colors',
  22: '👻 Move your mouse to wiggle the floating vector ghost',
  23: '🔊 Click inside preview to send ripple waves outward',
};



const initConfig = (params) =>
  Object.fromEntries(params.map(p => [p.key, p.default]));

/* ── Custom select — no native OS dropdown ─────────────── */
const SELECT_OPTIONS = ['Select option', 'Option Alpha', 'Option Beta', 'Option Gamma'];

function CustomSelect({ id }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(SELECT_OPTIONS[0]);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={`demo-custom-select ${open ? 'open' : ''}`} id={id}>
      <div className="demo-custom-select-trigger" onClick={() => setOpen(o => !o)}>
        <span>{selected}</span>
        <span className="demo-custom-select-arrow">›</span>
      </div>
      {open && (
        <div className="demo-custom-select-menu">
          {SELECT_OPTIONS.map((opt, i) => (
            <div
              key={i}
              className={`demo-custom-select-option ${opt === selected ? 'selected' : ''}`}
              onClick={() => { setSelected(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigPanel({ params, config, onChange, cursorId }) {
  return (
    <div className="config-panel">
      {/* Title + Reset in same row */}
      <div className="config-panel-header">
        <div className="config-panel-title">⚙ Configure</div>
        <button className="config-reset" onClick={() => onChange(null, null, true)}>↺ Reset</button>
      </div>
      <div className="config-panel-body">
        {params.map(p => {
          const val = config[p.key] ?? p.default;
          const uid = `tog-${cursorId}-${p.key}`;

          /* Toggles: label + switch in one row */
          if (p.type === 'toggle') {
            return (
              <div key={p.key} className="config-row config-row--toggle">
                <span className="config-label">{p.label}</span>
                <label className="config-toggle-label" htmlFor={uid}>
                  <input
                    type="checkbox"
                    id={uid}
                    checked={val === true || val === 1}
                    onChange={e => onChange(p.key, e.target.checked)}
                    className="config-toggle-input"
                  />
                  <span className="config-toggle-track">
                    <span className="config-toggle-thumb" />
                  </span>
                  <span className="config-toggle-text">{val ? 'On' : 'Off'}</span>
                </label>
              </div>
            );
          }

          /* Color: single row — label left, swatch + hex right */
          if (p.type === 'color') {
            return (
              <div key={p.key} className="config-row config-row--color">
                <label className="config-label">{p.label}</label>
                <div className="config-color-wrap">
                  <input type="color" value={val} onChange={e => onChange(p.key, e.target.value)} className="config-color" />
                  <span className="config-color-hex">{val}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={p.key} className="config-row">
              <div className="config-row-top">
                <label className="config-label">{p.label}</label>
                <span className="config-value">
                  {typeof val === 'number' ? val : val}
                </span>
              </div>
              {p.type === 'range' && (
                <input type="range" min={p.min} max={p.max} step={p.step}
                  value={val}
                  onChange={e => onChange(p.key, parseFloat(e.target.value))}
                  className="config-slider"
                />
              )}
              {p.type === 'text' && (
                <input type="text" value={val}
                  onChange={e => onChange(p.key, e.target.value)}
                  className="config-text-input"
                  maxLength={40}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CursorSlide({ cursor, index, total, isActive, onNavigate, onBack }) {
  const [modal, setModal] = useState(null);
  const [config, setConfig] = useState(() => initConfig(cursor.params));
  const demoRef = useRef(null);

  const CursorComponent = CURSOR_COMPONENTS[index - 1];
  const isGravity   = index === 9;          // GravityPull (was 9, RepelField removed)
  const physicsAttr = isGravity ? 'data-gravity' : null;
  const hint = HINTS[index];

  const handleConfigChange = useCallback((key, value, reset = false) => {
    if (reset) { setConfig(initConfig(cursor.params)); return; }
    setConfig(prev => ({ ...prev, [key]: value }));
  }, [cursor.params]);

  return (
    <div className="slide cursor-slide" id={`slide-${index}`}>
      {/* Slide header */}
      <div className="cursor-slide-header">
        <div className="cursor-slide-meta">
          <span className="cursor-slide-number">{String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <h2 className="cursor-slide-name gradient-text">{cursor.name}</h2>
          <p className="cursor-slide-desc">{cursor.description}</p>
        </div>
        <div className="cursor-slide-actions">
          <button className="btn btn-code" id={`btn-code-${index}`} onClick={() => setModal('code')}>
            &lt;/&gt; Code
          </button>
          <button className="btn btn-prompt" id={`btn-prompt-${index}`} onClick={() => setModal('prompt')}>
            ✦ Prompt
          </button>
        </div>
      </div>

      {/* Main body: preview + config */}
      <div className="demo-area">

        {/* Live preview — cursor confined here */}
        <div
          className="demo-canvas-area"
          ref={demoRef}
          style={{ cursor: 'none', position: 'relative', overflow: 'hidden' }}
        >
          {/* Cursor effect — ONLY rendered here, inside the preview box */}
          {isActive && (
            <CursorComponent containerRef={demoRef} config={config} />
          )}


          {hint && <div className="demo-hint">{hint}</div>}

          <div className="demo-buttons">
            <button className="btn btn-primary" id={`demo-primary-${index}`}
              {...(physicsAttr ? { [physicsAttr]: 'true' } : { 'data-magnetic': 'true' })}>
              Primary
            </button>
            <button className="btn btn-secondary" id={`demo-secondary-${index}`}
              {...(physicsAttr ? { [physicsAttr]: 'true' } : { 'data-magnetic': 'true' })}>
              Secondary
            </button>
            <button className="btn btn-ghost" id={`demo-ghost-${index}`}
              {...(physicsAttr ? { [physicsAttr]: 'true' } : { 'data-magnetic': 'true' })}>
              Ghost Style
            </button>
          </div>

          <p className="hoverable-text">
            <strong>Move inside this box</strong> to see the <em style={{ color: 'var(--accent)' }}>{cursor.name}</em> effect. Move fast, slow, zigzag — every motion matters.
          </p>

          <div className="demo-drag-zone" {...(physicsAttr ? { [physicsAttr]: 'true' } : {})}>
            ⊞ Hover this zone
          </div>

          {/* Input interaction section */}
          <div className="demo-input-section">
            <span className="demo-input-label">✎ Type &amp; Interact</span>
            <div className="demo-input-row">
              <div className="demo-input-wrap">
                <input
                  type="text"
                  className="demo-field"
                  placeholder="Text field…"
                  id={`field-text-${index}`}
                  spellCheck={false}
                />
              </div>
              <div className="demo-input-wrap">
                <input
                  type="search"
                  className="demo-field"
                  placeholder="Search…"
                  id={`field-search-${index}`}
                />
              </div>
              <div className="demo-input-wrap">
                <CustomSelect id={`field-select-${index}`} />
              </div>
            </div>
            <div className="demo-check-row">
              {['Hover me', 'Click me', 'Try me'].map((label, i) => (
                <label key={i} className="demo-check-label" htmlFor={`chk-${index}-${i}`}>
                  <input type="checkbox" id={`chk-${index}-${i}`} className="demo-check" />
                  <span className="demo-check-box" />
                  <span>{label}</span>
                </label>
              ))}
              <label className="demo-check-label" htmlFor={`radio-${index}`}>
                <input type="radio" id={`radio-${index}`} name={`radio-${index}`} className="demo-check" />
                <span className="demo-check-box demo-check-box--radio" />
                <span>Radio</span>
              </label>
            </div>
          </div>
        </div>

        {/* Config panel — replaces sidebar cards */}
        <ConfigPanel
          params={cursor.params}
          config={config}
          onChange={handleConfigChange}
          cursorId={cursor.id}
        />
      </div>
      {modal && <CodeModal cursor={cursor} config={config} defaultTab={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
