import { useEffect, useRef } from 'react';

const CLICK_COLORS = ['#7c5cfc','#5cf4fc','#fc5cb8','#5cfca8','#fca85c','#ff4455'];
const checkPointer = (cx, cy) =>
  document.elementsFromPoint(cx, cy).some(el =>
    ['BUTTON', 'INPUT', 'A', 'LABEL'].includes(el.tagName) ||
    el.classList.contains('btn') ||
    el.classList.contains('demo-custom-select-trigger') ||
    el.classList.contains('demo-check-label')
  );

export default function MorphingBlobCursor({ containerRef, config }) {
  return null;
}
