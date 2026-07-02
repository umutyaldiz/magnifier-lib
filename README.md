🇬🇧 **English** · [🇹🇷 Türkçe](README.tr.md)

# a11y-magnifier

**A zero-dependency, cursor-following screen magnifier widget for the web.**
Built for low-vision accessibility on news sites and other text-heavy pages — drop in a script tag, no build step, no framework required.

[![npm version](https://img.shields.io/npm/v/a11y-magnifier.svg)](https://www.npmjs.com/package/a11y-magnifier)
[![license: MIT](https://img.shields.io/npm/l/a11y-magnifier.svg)](LICENSE)
[![no dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/a11y-magnifier)](https://bundlephobia.com/package/a11y-magnifier)

**[📖 Live Storybook demo — try every option](https://umutyaldiz.github.io/magnifier-lib/)**

## Why this exists

Low-vision readers are a huge, under-served slice of the web's audience, and most sites have no magnification option beyond the browser's own zoom — which breaks layouts and loses the point you were reading. The alternative is usually an expensive SaaS overlay widget. This library is the free, open, embeddable middle ground: a lens that follows the cursor, keeps text sharp, and can be added to any page — including ones you don't control the build pipeline for — in one line.

It doesn't replace a full accessibility audit, but a pointer-driven magnifier is concretely useful for low-vision users today, and every site should be able to add one without a procurement process.

## Features

- ⚙️ Zero runtime dependencies, written in TypeScript, ~11 KB minified
- 🎯 Follows the mouse cursor; optionally hides the native cursor while active
- 🔵 Circle, square, or rectangle lens shapes
- 🖼️ Canvas-based rendering by default (SVG `foreignObject` snapshot → `<canvas>`) — doesn't touch the live DOM, GPU-accelerated `drawImage` zoom
- 🎚️ Every option is live-tunable at runtime via `setOptions()`
- ⌨️ Configurable keyboard shortcut (default `Alt+M`)
- 🔁 Toggle from a button, or auto-enable with `autoStart: true`
- 📰 `excludeSelectors` hides the lens over ad slots, video players, or any other region you specify
- 📝 Full type definitions generated straight from source (`dist/magnifier.d.ts`) — no `@types` package needed
- 📚 Full interactive Storybook covering every constructor option

## Install

```bash
npm install a11y-magnifier
```

```js
// CommonJS
const Magnifier = require('a11y-magnifier');

// ESM / bundlers (webpack, Vite, Rollup, Next.js, ...)
import Magnifier from 'a11y-magnifier';
```

Or skip the build step entirely and load it straight from a CDN — this bundle has no module format requirements at all, it just sets `window.Magnifier`:

```html
<script src="https://cdn.jsdelivr.net/npm/a11y-magnifier/dist/magnifier.global.min.js"></script>
<script>
  const mag = new Magnifier({ shape: 'circle', zoom: 2 });
  mag.enable();
</script>
```

## Quick start

```js
// Button-controlled
const mag = new Magnifier({ shape: 'circle', size: 220, zoom: 2 });
document.getElementById('magBtn').addEventListener('click', () => mag.toggle());

// Active as soon as the page loads
new Magnifier({ autoStart: true, shape: 'circle', zoom: 2.5 });
```

## API

### `new Magnifier(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `shape` | `'circle' \| 'square' \| 'rectangle'` | `'circle'` | Lens shape |
| `size` | `number` | `220` | Diameter/side for `circle` and `square` (px) |
| `width` | `number` | `360` | Width for `rectangle` |
| `height` | `number` | `220` | Height for `rectangle` |
| `zoom` | `number` | `2` | Magnification factor |
| `borderWidth` | `number` | `3` | Border thickness |
| `borderColor` | `string` | `rgba(255,255,255,.95)` | Border color |
| `borderStyle` | `string` | `'solid'` | CSS `border-style` |
| `borderRadius` | `number` | `8` | Corner radius for square/rectangle |
| `shadow` | `string` | `'0 10px 40px ...'` | CSS `box-shadow` |
| `background` | `string` | `'#ffffff'` | Lens background |
| `crosshair` | `boolean` | `false` | Show a center-point indicator |
| `crosshairColor` | `string` | `rgba(255,0,0,.6)` | Crosshair color |
| `autoStart` | `boolean` | `false` | Enable automatically on page load |
| `hideCursor` | `boolean` | `true` | Hide the native page cursor while active |
| `smooth` | `boolean` | `true` | Animate lens movement |
| `smoothDuration` | `number` | `50` | Transition duration (ms) |
| `offsetX` / `offsetY` | `number` | `0` | Lens offset relative to the cursor |
| `zIndex` | `number` | `2147483646` | Lens `z-index` |
| `renderMode` | `'canvas' \| 'clone' \| 'auto'` | `'canvas'` | Rendering strategy (see below) |
| `excludeSelectors` | `string[]` | `[]` | Selectors under which the lens hides (e.g. `['.ad-slot', '.video-ad']`) |
| `refreshIntervalMs` | `number` | `500` | Snapshot/clone refresh interval (ms) |
| `keyboardShortcut` | `string \| false` | `'m'` | Key that toggles the magnifier; `false` disables it |
| `shortcutWithCtrl` | `boolean` | `false` | Require Ctrl/Cmd |
| `shortcutWithAlt` | `boolean` | `true` | Require Alt |
| `shortcutWithShift` | `boolean` | `false` | Require Shift |
| `onEnable` | `function` | `null` | Called when enabled |
| `onDisable` | `function` | `null` | Called when disabled |
| `onMove` | `function` | `null` | Called with `(x, y)` cursor coordinates |

### `renderMode`

| Value | Description |
|---|---|
| `'canvas'` | The page is snapshotted into a `<canvas>` via an SVG `foreignObject`; no second DOM tree is created inside the lens, and magnification uses GPU-accelerated `drawImage`. **Recommended.** |
| `'clone'` | `document.body` is cloned into the lens and scaled with a CSS `transform: scale()`. More reliable on pages with cross-origin images. |
| `'auto'` | Uses `'canvas'` when supported, otherwise falls back to `'clone'`. |

### Methods

| Method | Description |
|---|---|
| `.enable()` | Turn the magnifier on |
| `.disable()` | Turn the magnifier off |
| `.toggle()` | Toggle on/off |
| `.isEnabled()` | Whether it's currently on |
| `.setOptions(opts)` | Update options at runtime |
| `.getOptions()` | Get the current options |
| `.destroy()` | Remove all listeners permanently |

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt + M` | Toggle the magnifier (default) |
| `Esc` | *(not built-in — wire it yourself, see below)* |

The shortcut is ignored while focus is inside an `input`, `textarea`, or `contenteditable` element.

## Real-world scenario: a news site

```js
const mag = new Magnifier({
  shape: 'circle',
  size: 240,
  zoom: 2.2,
  renderMode: 'canvas',
  autoStart: false,
  excludeSelectors: ['.ad-slot', '.gpt-ad', '.video-player', '[data-ad]'],
  keyboardShortcut: 'm',
  shortcutWithAlt: true,
});

// Wire it to an accessibility menu toggle
document.querySelector('#accessibility-magnifier-toggle')
  .addEventListener('click', () => mag.toggle());

// Optional: let Esc close it too
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mag.isEnabled()) mag.disable();
});
```

## Notes & limitations

- **Canvas mode (default):** page content is written into a canvas via an SVG `foreignObject`; no second DOM tree is created inside the lens. `drawImage` magnification is GPU-accelerated. Cross-origin `<img>` or `<iframe>` elements cannot be captured in the snapshot (a browser security restriction) — this rarely matters for a news site's own article content.
- **Clone mode:** applies a CSS scale to a DOM clone of the page. `<canvas>` elements and cross-origin `<iframe>` content may not appear magnified in this mode either. Prefer this mode if your page serves cross-origin images.
- Setting `refreshIntervalMs` very low increases CPU usage; the default (500ms) is fine for most pages.
- The keyboard shortcut never fires while typing in an input, textarea, or contenteditable element.

## Development

The source is TypeScript (`src/`), built with [tsup](https://tsup.egoist.dev) into four `dist/` bundles: `magnifier.js` (CJS), `magnifier.mjs` (ESM), `magnifier.global.js` / `magnifier.global.min.js` (IIFE, sets `window.Magnifier` — used by the CDN snippet above), plus generated `.d.ts` types.

```bash
npm install
npm run storybook        # interactive playground — every option, live
npm run typecheck        # tsc --noEmit
npm run build             # produces the dist/ bundles described above
npm run build-storybook   # static Storybook build (used by CI/Pages deploy)
```

Contributions, issues, and ideas are welcome — open a PR or an issue on GitHub.

## License

MIT © [Umut Yaldız](https://github.com/umutyaldiz)

## Author

**Umut Yaldız** — [github.com/umutyaldiz](https://github.com/umutyaldiz)
