# CursorX: Interactive Cursor Effects — Quick Guide

A premium gallery of 24 interactive, high-performance mouse cursor effects built with React, Canvas API, and CSS. Scroll through the slides, customize parameters, view underlying code, and export custom React hooks.

> [!IMPORTANT]
> **Unlike heavy visual galleries** that rely on bulky external libraries or third-party web frameworks, CursorX runs **fully client-side** using vanilla CSS, React, and native HTML5 Canvas drawing loops. It runs completely offline with zero loading lag.

---

## Table of Contents

- [How to Run](#how-to-run)
  - [Option A: From Source (Development)](#option-a-from-source-development)
  - [Option B: Production Sandbox](#option-b-production-sandbox)
- [Performance Optimization and Browser Acceleration](#performance-optimization-and-browser-acceleration)
- [Usage Basics and Interface Map](#usage-basics-and-interface-map)
- [Directory Index Checklist](#directory-index-checklist)

---

## How to Run

### Option A: From Source (Development)

**Prerequisites:** Node.js (v18+), npm or yarn.

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev
```

On launch, open the displayed local URL (typically `http://localhost:5173`) in your browser. You can navigate the slide deck and interact with the cursor sandboxes.

### Option B: Production Sandbox

To bundle the application for production deployment and run a local preview:

```bash
# Build the optimized assets
npm run build

# Preview the production build locally
npm run preview
```

> [!NOTE]
> The build process produces a static single-page application under the `dist/` directory. You can deploy this directory to any static hosting provider (e.g. Vercel, Netlify, Github Pages). The serverless API handler under `api/contact.js` will route emails if deployed on Vercel with a set `RESEND_API_KEY` environment variable.

---

## Performance Optimization and Browser Acceleration

Cursor animations can be resource-intensive. To ensure 60fps rendering, apply the following optimizations:

### Enable Graphics Acceleration
Make sure graphics/hardware acceleration is active in your web browser:
* **Google Chrome / Brave**: `Settings -> System -> Use graphics acceleration when available` (Toggle to ON).
* **Firefox**: `Settings -> General -> Performance -> Use recommended performance settings` (Check ON) and `Use hardware acceleration when available` (Check ON).

### Developer Optimization Guidelines
If you are writing or customizing a cursor in the catalog, follow these performance failsafes:
* **Canvas Sizing**: Always clip and restrict canvas bounds to the preview element (`containerRef`) instead of the global `window.innerWidth`/`window.innerHeight`. This reduces the canvas drawing buffer size.
* **will-change promotion**: For CSS-based cursors that update transforms on mousemove, promote elements to their own compositing layers by applying `will-change: transform, left, top;` in CSS.
* **Clean up Animation Loops**: When writing `requestAnimationFrame` drawing loops, always store the returned `rafId` and invoke `cancelAnimationFrame(rafId)` when the component unmounts.
* **Clean up Event Listeners**: Always unregister mouse, click, and resize event listeners on unmount:
  ```javascript
  useEffect(() => {
    const handleMove = (e) => { ... };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  ```

---

## Usage Basics and Interface Map

### Navigating the Carousel
* **Vertical Scroll**: Scroll your mouse wheel or swipe on a trackpad to advance slides.
* **Arrow Keys**: Press `Arrow Down` or `Page Down` to scroll down, and `Arrow Up` or `Page Up` to scroll up.
* **Vertical NavDots**: Click the dots on the right side of the screen to jump to a slide index.
* **Navbar Dropdown**: Open the dropdown menu in the header and click a cursor name to jump directly to its slide.

### Sandbox Interface
Inside each cursor slide, the screen is split into a 5:3 visual layout:
* **Interactive Preview Sandbox (Left)**: Hover, click, and drag to interact with the cursor. Inside, you will find interactive elements like buttons, custom checkboxes, and custom select dropdowns to test target attraction/inversion.
* **Configuration & Info Panel (Right)**:
  * **Tagline & Description**: Highlights the design concept.
  * **Tech Tags**: Indicates the underlying API (e.g., Canvas, Spring Physics).
  * **Sliders and Swatches**: Adjust sizes, speeds, hues, or stiffness.
  * **Reset Button**: Click in the top-right of the config card to restore default presets.
  * **View Code**: Opens a code-viewer overlay containing the copyable source code.

---

## Directory Index Checklist

Refer to the checklist below to navigate and modify CursorX files:

| File / Folder | Status | Functional Purpose |
|---|---|---|
| `[x] src/main.jsx` | Completed | React application entry point. Mounts the root component inside `index.html`. |
| `[x] src/App.jsx` | Completed | Core layout orchestrator. Handles scroll events, page transitions, and renders the global Difference Blend cursor. |
| `[x] src/index.css` | Completed | Main design system. Defines color tokens, glassmorphism templates, layout slides, and responsive CSS rules. |
| `[x] src/data/cursors.js` | Completed | Core dataset. Contains names, taglines, parameters, descriptions, and stringified copy-paste code hooks for the 24 cursors. |
| `[x] src/cursors/` | Completed | Directory containing the 24 individual JSX custom cursor components. |
| `[x] src/components/` | Completed | UI layouts: Navbar, indicator dots, CodeModal, sections (Hero, Tutorial, Contact, QuickLinks). |
| `[x] api/contact.js` | Completed | Secure serverless backend route for contact submissions (integrates with Resend). |
| `[x] vite.config.js` | Completed | Vite compilation rules and dev server parameters. |
| `[x] README.md` | Completed | High-level technical overview, catalog, architecture diagrams, and installation guide. |
