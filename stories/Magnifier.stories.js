import Magnifier from '../src/index.ts';
import { renderSamplePage } from './sample-page.js';

let activeMagnifier = null;

function destroyActive() {
  if (activeMagnifier) {
    activeMagnifier.destroy();
    activeMagnifier = null;
  }
}

function statusPanel() {
  const panel = document.createElement('div');
  panel.className =
    'tw:fixed tw:top-4 tw:right-4 tw:z-[2147483647] tw:bg-white tw:rounded-xl tw:shadow-lg tw:border tw:border-slate-200 tw:px-4 tw:py-3 tw:text-xs tw:font-mono tw:text-slate-600 tw:space-y-1';
  panel.innerHTML = `
    <div>status: <span data-status class="tw:font-bold tw:text-slate-900">disabled</span></div>
    <div>cursor: <span data-coords class="tw:font-bold tw:text-slate-900">–, –</span></div>
    <button data-toggle type="button"
      class="tw:mt-1 tw:w-full tw:bg-red-700 tw:text-white tw:rounded-lg tw:px-3 tw:py-1.5 tw:font-sans tw:font-semibold tw:text-xs">
      Toggle (or Alt+M)
    </button>
  `;
  return panel;
}

/**
 * Builds the sample article + a live Magnifier instance wired to `args`.
 * Any previously mounted instance is torn down first, since Storybook
 * re-invokes this render function on every control change.
 */
function renderDemo(args) {
  destroyActive();

  const wrapper = document.createElement('div');
  const page = renderSamplePage({ withAd: !!args.__withAd });
  const status = statusPanel();
  wrapper.appendChild(page);
  wrapper.appendChild(status);

  const statusEl = status.querySelector('[data-status]');
  const coordsEl = status.querySelector('[data-coords]');

  const { __withAd, ...options } = args;

  activeMagnifier = new Magnifier({
    ...options,
    onEnable: () => { statusEl.textContent = 'enabled'; },
    onDisable: () => { statusEl.textContent = 'disabled'; },
    onMove: (x, y) => { coordsEl.textContent = `${Math.round(x)}, ${Math.round(y)}`; },
  });

  status.querySelector('[data-toggle]').addEventListener('click', () => activeMagnifier.toggle());

  return wrapper;
}

export default {
  title: 'Magnifier/Playground',
  render: renderDemo,
  argTypes: {
    shape: { control: 'select', options: ['circle', 'square', 'rectangle'], description: 'Lens shape.' },
    size: { control: { type: 'range', min: 100, max: 450, step: 10 }, description: "Diameter/side for 'circle' and 'square'." },
    width: { control: { type: 'range', min: 200, max: 600, step: 10 }, description: "Width for 'rectangle'." },
    height: { control: { type: 'range', min: 100, max: 400, step: 10 }, description: "Height for 'rectangle'." },
    zoom: { control: { type: 'range', min: 1.2, max: 5, step: 0.1 }, description: 'Magnification factor.' },
    borderWidth: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    borderColor: { control: 'color' },
    borderStyle: { control: 'select', options: ['solid', 'dashed', 'dotted', 'double'] },
    borderRadius: { control: { type: 'range', min: 0, max: 40, step: 1 } },
    shadow: { control: 'text' },
    background: { control: 'color' },
    crosshair: { control: 'boolean' },
    crosshairColor: { control: 'color' },
    autoStart: { control: 'boolean', description: 'Enable immediately on mount.' },
    hideCursor: { control: 'boolean' },
    smooth: { control: 'boolean' },
    smoothDuration: { control: { type: 'range', min: 0, max: 300, step: 10 } },
    offsetX: { control: { type: 'range', min: -100, max: 100, step: 5 } },
    offsetY: { control: { type: 'range', min: -100, max: 100, step: 5 } },
    excludeSelectors: { control: 'object', description: "CSS selectors under which the lens hides — try adding '.ad-slot'." },
    renderMode: { control: 'select', options: ['canvas', 'clone', 'auto'] },
    refreshIntervalMs: { control: { type: 'range', min: 100, max: 2000, step: 100 } },
    keyboardShortcut: { control: 'text', description: "Set to false (via the Object view) to disable." },
    shortcutWithCtrl: { control: 'boolean' },
    shortcutWithAlt: { control: 'boolean' },
    shortcutWithShift: { control: 'boolean' },
    zIndex: { table: { disable: true } },
    onEnable: { table: { disable: true } },
    onDisable: { table: { disable: true } },
    onMove: { table: { disable: true } },
    __withAd: { name: 'show ad slot', control: 'boolean', description: 'Demo-only toggle for the sample ad block (not a Magnifier option).' },
  },
  args: {
    shape: 'circle',
    size: 220,
    width: 360,
    height: 220,
    zoom: 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderStyle: 'solid',
    borderRadius: 8,
    shadow: '0 10px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.15)',
    background: '#ffffff',
    crosshair: false,
    crosshairColor: 'rgba(255,0,0,.6)',
    autoStart: true,
    hideCursor: true,
    smooth: true,
    smoothDuration: 50,
    offsetX: 0,
    offsetY: 0,
    excludeSelectors: ['.ad-slot'],
    renderMode: 'canvas',
    refreshIntervalMs: 500,
    keyboardShortcut: 'm',
    shortcutWithCtrl: false,
    shortcutWithAlt: true,
    shortcutWithShift: false,
    __withAd: true,
  },
};

export const Playground = {};

export const CircleShape = {
  args: { shape: 'circle', size: 220 },
};

export const SquareShape = {
  args: { shape: 'square', size: 240, borderRadius: 12 },
};

export const RectangleShape = {
  args: { shape: 'rectangle', width: 380, height: 220 },
};

export const HighZoom = {
  name: 'High zoom (4.5x)',
  args: { zoom: 4.5, size: 260 },
};

export const WithCrosshair = {
  args: { crosshair: true, crosshairColor: 'rgba(200,16,46,.8)' },
  parameters: {
    docs: { description: { story: 'A center crosshair helps users line up precisely on small targets like form fields or icons.' } },
  },
};

export const CanvasRenderMode = {
  name: 'Render mode — canvas (default)',
  args: { renderMode: 'canvas' },
  parameters: {
    docs: {
      description: {
        story:
          'The page is snapshotted into an off-screen `<canvas>` via an SVG `foreignObject`, then magnified with `drawImage`. No second DOM tree is created.',
      },
    },
  },
};

export const CloneRenderMode = {
  name: 'Render mode — clone',
  args: { renderMode: 'clone' },
  parameters: {
    docs: {
      description: {
        story:
          '`document.body` is cloned and scaled with a CSS `transform`. More reliable when the page has cross-origin images the canvas mode cannot read.',
      },
    },
  },
};

export const HidingOverAdSlots = {
  name: 'excludeSelectors — hides over ad slots',
  args: { excludeSelectors: ['.ad-slot'], __withAd: true },
  parameters: {
    docs: {
      description: {
        story:
          'The lens disappears whenever the cursor is over an element matching `excludeSelectors` — move over the dashed "ad slot" block below to see it vanish.',
      },
    },
  },
};

export const KeyboardShortcut = {
  name: 'Keyboard shortcut — Alt+M',
  args: { keyboardShortcut: 'm', shortcutWithAlt: true, autoStart: false },
  parameters: {
    docs: {
      description: {
        story: 'Press **Alt+M** anywhere on the canvas to toggle the magnifier without touching the mouse.',
      },
    },
  },
};

export const Callbacks = {
  name: 'onEnable / onDisable / onMove callbacks',
  args: { autoStart: false },
  parameters: {
    docs: {
      description: {
        story:
          'The status panel in the top-right corner of every story is itself powered by `onEnable`, `onDisable`, and `onMove` — open this story and toggle the lens to watch it update live.',
      },
    },
  },
};
