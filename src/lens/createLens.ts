import type { ResolvedMagnifierOptions, MagnifierRenderMode } from '../types';

export interface LensRefs {
  el: HTMLDivElement;
  inner: HTMLDivElement | null;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
}

export function getLensSize(options: ResolvedMagnifierOptions): { w: number; h: number } {
  if (options.shape === 'rectangle') return { w: options.width, h: options.height };
  return { w: options.size, h: options.size };
}

/**
 * Builds the fixed-position lens element and, depending on render mode,
 * either a <canvas> (canvas mode draws snapshots into it) or an inner <div>
 * (clone mode scales a DOM clone inside it).
 */
export function createLens(options: ResolvedMagnifierOptions, renderMode: MagnifierRenderMode): LensRefs {
  const { w, h } = getLensSize(options);
  const radius = options.shape === 'circle' ? '50%' : `${options.borderRadius}px`;

  const lens = document.createElement('div');
  lens.setAttribute('aria-hidden', 'true');
  lens.setAttribute('data-magnifier-lens', '');
  Object.assign(lens.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${w}px`,
    height: `${h}px`,
    borderRadius: radius,
    border: `${options.borderWidth}px ${options.borderStyle} ${options.borderColor}`,
    boxShadow: options.shadow,
    background: options.background,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: String(options.zIndex),
    transform: 'translate3d(-9999px,-9999px,0)',
    willChange: 'transform',
    transition: options.smooth ? `transform ${options.smoothDuration}ms linear` : 'none',
    display: 'none',
  });

  let inner: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;

  if (renderMode === 'canvas') {
    // Canvas-based render: the page snapshot is drawn into `canvas` via
    // drawImage — no second DOM tree lives inside the lens.
    const dpr = window.devicePixelRatio || 1;
    canvas = document.createElement('canvas');
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: `${w}px`,
      height: `${h}px`,
      pointerEvents: 'none',
    });
    lens.appendChild(canvas);
    ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr); // HiDPI — logical coordinates are used everywhere else
  } else {
    // DOM clone render: a body clone is scaled inside `inner` via CSS transform.
    inner = document.createElement('div');
    inner.setAttribute('data-magnifier-inner', '');
    Object.assign(inner.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: `${document.documentElement.clientWidth}px`,
      height: `${window.innerHeight}px`,
      transformOrigin: '0 0',
      pointerEvents: 'none',
    });
    lens.appendChild(inner);
  }

  if (options.crosshair) {
    const ch = document.createElement('div');
    Object.assign(ch.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '10px',
      height: '10px',
      marginLeft: '-5px',
      marginTop: '-5px',
      border: `1px solid ${options.crosshairColor}`,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '2',
    });
    lens.appendChild(ch);
  }

  document.body.appendChild(lens);
  return { el: lens, inner, canvas, ctx };
}
