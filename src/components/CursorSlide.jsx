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
import RepelFieldCursor from '../cursors/RepelFieldCursor.jsx';
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

const CURSOR_COMPONENTS = [
  MagneticCursor, ParticleTrailCursor, SpotlightCursor, MorphingBlobCursor,
  PixelShatterCursor, ElasticRingCursor, NeonGlowCursor, TextOrbiterCursor,
  GravityPullCursor, RepelFieldCursor, ConstellationCursor, FireTrailCursor,
  CrosshairScopeCursor, MirrorGhostCursor, RainbowCometCursor, BubbleFloatCursor,
  RippleWaveCursor, GlitchShiftCursor, WindStreamCursor, DNAHelixCursor, TorchLightCursor,
];

const HINTS = {
  1:  '🧲 Hover the demo buttons — feel the pull',
  7:  '🌈 Click inside preview to cycle through 5 neon colors',
  9:  '⚡ Move over the buttons — gravity attracts them',
  10: '💥 Move over the buttons — repel pushes them away',
  13: '🎯 Click inside preview to lock on target',
  17: '💧 Click inside preview to create ripples',
  18: '⚡ Glitch bursts fire automatically every ~2 seconds',
  21: '🕯 The light flickers and lags — navigate the dark',
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

function ConfigPanel({ params, config, onChange }) {
  return (
    <div className="config-panel">
      <div className="config-panel-title">⚙ Configure</div>
      {params.map(p => {
        const val = config[p.key] ?? p.default;
        return (
          <div key={p.key} className="config-row">
            <div className="config-row-top">
              <label className="config-label">{p.label}</label>
              {p.type !== 'toggle' && (
                <span className="config-value">
                  {p.type === 'color' ? val : typeof val === 'number' ? val : val}
                </span>
              )}
            </div>
            {p.type === 'color' && (
              <div className="config-color-wrap">
                <input type="color" value={val} onChange={e => onChange(p.key, e.target.value)} className="config-color" />
                <span className="config-color-hex">{val}</span>
              </div>
            )}
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
            {p.type === 'toggle' && (
              <label className="config-toggle-label" htmlFor={`tog-${p.key}`}>
                <input
                  type="checkbox"
                  id={`tog-${p.key}`}
                  checked={val === true || val === 1}
                  onChange={e => onChange(p.key, e.target.checked)}
                  className="config-toggle-input"
                />
                <span className="config-toggle-track">
                  <span className="config-toggle-thumb" />
                </span>
                <span className="config-toggle-text">{val ? 'On' : 'Off'}</span>
              </label>
            )}
          </div>
        );
      })}
      <button className="config-reset" onClick={() => onChange(null, null, true)}>↺ Reset Defaults</button>
    </div>
  );
}

export default function CursorSlide({ cursor, index, total, isActive, onNavigate, onBack }) {
  return null;
}
