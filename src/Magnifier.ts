import type { MagnifierOptions, ResolvedMagnifierOptions, MagnifierRenderMode } from './types';
import { DEFAULTS } from './defaults';
import { injectCursorStyle, removeCursorStyle } from './cursor';
import { matchesShortcut } from './keyboard';
import { createLens, getLensSize } from './lens/createLens';
import { CanvasCapture } from './capture/CanvasCapture';
import { CloneCapture } from './capture/CloneCapture';

const VERSION = '2.0.1';

/**
 * Cursor-following, shape-configurable screen magnifier with zero runtime
 * dependencies. See README.md for the full option reference.
 */
export class Magnifier {
  static readonly version = VERSION;

  private options: ResolvedMagnifierOptions;
  private enabled = false;
  private renderMode: MagnifierRenderMode | null = null;

  private lens: HTMLDivElement | null = null;
  private inner: HTMLDivElement | null = null;
  private lensCanvas: HTMLCanvasElement | null = null;
  private lensCtx: CanvasRenderingContext2D | null = null;

  private canvasCapture: CanvasCapture | null = null;
  private cloneCapture: CloneCapture | null = null;

  private cursorStyle: HTMLStyleElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private rafId: number | null = null;
  private cloneTimer: ReturnType<typeof setInterval> | null = null;
  private mo: MutationObserver | null = null;
  private moPending = false;

  constructor(options: MagnifierOptions = {}) {
    this.options = { ...DEFAULTS, ...options };

    if (this.options.keyboardShortcut) {
      document.addEventListener('keydown', this.onKeyDown, true);
    }

    if (this.options.autoStart) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.enable(), { once: true });
      } else {
        this.enable();
      }
    }
  }

  /* -------- Public API -------- */

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;

    const rm = this.options.renderMode;
    this.renderMode = rm === 'auto' ? (this.supportsCanvas() ? 'canvas' : 'clone') : rm;

    this.createLensElement();

    if (this.renderMode === 'canvas') {
      this.canvasCapture = new CanvasCapture(() => {
        if (!this.rafId) this.rafId = requestAnimationFrame(this.tick);
      });
      this.canvasCapture.init();
      this.canvasCapture.schedule();
      this.cloneTimer = setInterval(() => this.canvasCapture?.schedule(), this.options.refreshIntervalMs);
    } else {
      this.cloneCapture = new CloneCapture(this.inner as HTMLDivElement);
      this.cloneCapture.build();
      this.cloneTimer = setInterval(() => this.cloneCapture?.refresh(), this.options.refreshIntervalMs);
    }

    this.cursorStyle = this.options.hideCursor ? injectCursorStyle() : null;

    document.addEventListener('mousemove', this.onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', this.onMouseLeave);
    document.documentElement.addEventListener('mouseenter', this.onMouseEnter);
    window.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
    window.addEventListener('resize', this.onResize);

    if (typeof MutationObserver !== 'undefined') {
      this.mo = new MutationObserver(() => {
        if (this.moPending) return;
        this.moPending = true;
        setTimeout(() => {
          this.moPending = false;
          if (!this.enabled) return;
          if (this.renderMode === 'canvas') this.canvasCapture?.schedule();
          else this.cloneCapture?.refresh();
        }, 200);
      });
      this.mo.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    }

    this.callCallback('onEnable');
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;

    document.removeEventListener('mousemove', this.onMouseMove);
    document.documentElement.removeEventListener('mouseleave', this.onMouseLeave);
    document.documentElement.removeEventListener('mouseenter', this.onMouseEnter);
    window.removeEventListener('scroll', this.onScroll, true);
    window.removeEventListener('resize', this.onResize);

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.cloneTimer) {
      clearInterval(this.cloneTimer);
      this.cloneTimer = null;
    }
    if (this.mo) {
      this.mo.disconnect();
      this.mo = null;
    }

    this.removeLensElement();
    removeCursorStyle(this.cursorStyle);
    this.cursorStyle = null;
    this.callCallback('onDisable');
  }

  toggle(): void {
    this.enabled ? this.disable() : this.enable();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setOptions(newOptions: MagnifierOptions = {}): void {
    const wasEnabled = this.enabled;
    this.options = { ...this.options, ...newOptions };
    if (wasEnabled) {
      this.disable();
      this.enable();
    }
  }

  getOptions(): ResolvedMagnifierOptions {
    return { ...this.options };
  }

  destroy(): void {
    this.disable();
    if (this.options.keyboardShortcut) {
      document.removeEventListener('keydown', this.onKeyDown, true);
    }
  }

  /* -------- Private -------- */

  private supportsCanvas(): boolean {
    try {
      return !!(
        typeof document.createElement('canvas').getContext === 'function' &&
        typeof XMLSerializer !== 'undefined' &&
        typeof URL.createObjectURL === 'function'
      );
    } catch (e) {
      return false;
    }
  }

  private callCallback(name: 'onEnable' | 'onDisable'): void {
    const cb = this.options[name];
    if (typeof cb === 'function') {
      try {
        cb.call(this);
      } catch (e) {
        /* swallow */
      }
    }
  }

  private createLensElement(): void {
    const { el, inner, canvas, ctx } = createLens(this.options, this.renderMode as MagnifierRenderMode);
    this.lens = el;
    this.inner = inner;
    this.lensCanvas = canvas;
    this.lensCtx = ctx;
  }

  private removeLensElement(): void {
    if (this.lens && this.lens.parentNode) {
      this.lens.parentNode.removeChild(this.lens);
    }
    this.lens = null;
    this.inner = null;
    this.lensCanvas = null;
    this.lensCtx = null;
    this.canvasCapture?.destroy();
    this.canvasCapture = null;
    this.cloneCapture = null;
  }

  /* ---- Event handlers ---- */

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    const excluded = this.options.excludeSelectors;
    if (excluded && excluded.length) {
      const sel = excluded.join(',');
      const target = e.target as Element | null;
      if (target && target.closest(sel)) {
        if (this.lens) this.lens.style.display = 'none';
        return;
      }
    }

    if (!this.rafId) this.rafId = requestAnimationFrame(this.tick);
  };

  private onMouseLeave = (): void => {
    if (this.lens) this.lens.style.display = 'none';
  };

  private onMouseEnter = (): void => {
    if (this.lens) this.lens.style.display = 'block';
  };

  private onScroll = (): void => {
    if (!this.rafId) this.rafId = requestAnimationFrame(this.tick);
  };

  private onResize = (): void => {
    if (this.renderMode === 'clone' && this.inner) {
      this.inner.style.width = `${document.documentElement.clientWidth}px`;
      this.cloneCapture?.refresh();
    } else if (this.renderMode === 'canvas') {
      this.canvasCapture?.schedule();
    }
    if (!this.rafId) this.rafId = requestAnimationFrame(this.tick);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (matchesShortcut(e, this.options)) {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    }
  };

  /* ---- Render tick ---- */

  private tick = (): void => {
    this.rafId = null;
    if (!this.enabled || !this.lens) return;

    const opt = this.options;
    const { w: lensW, h: lensH } = getLensSize(opt);

    const lensX = this.mouseX - lensW / 2 + opt.offsetX;
    const lensY = this.mouseY - lensH / 2 + opt.offsetY;

    this.lens.style.display = 'block';
    this.lens.style.transform = `translate3d(${lensX}px, ${lensY}px, 0)`;

    const pageCanvas = this.canvasCapture?.source ?? null;

    if (this.renderMode === 'canvas' && this.lensCtx && pageCanvas && this.canvasCapture?.isReady) {
      // Canvas mode: copy the magnified region of the page snapshot into the
      // lens canvas. drawImage's source→destination scaling is the zoom —
      // no CSS transform needed.
      const z = opt.zoom;
      const srcW = lensW / z;
      const srcH = lensH / z;
      const srcX = this.mouseX - srcW / 2;
      const srcY = this.mouseY + window.scrollY - srcH / 2;

      const maxX = pageCanvas.width - srcW;
      const maxY = pageCanvas.height - srcH;
      const cx = Math.max(0, Math.min(srcX, maxX));
      const cy = Math.max(0, Math.min(srcY, maxY));

      this.lensCtx.clearRect(0, 0, lensW, lensH);
      this.lensCtx.drawImage(pageCanvas, cx, cy, srcW, srcH, 0, 0, lensW, lensH);
    } else if (this.renderMode !== 'canvas' && this.inner) {
      // Clone mode: magnify the DOM clone with a CSS transform.
      const z = opt.zoom;
      const tx = -(this.mouseX * z) + lensW / 2;
      const ty = -((this.mouseY + window.scrollY) * z) + lensH / 2;
      this.inner.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
    }

    if (typeof opt.onMove === 'function') {
      try {
        opt.onMove.call(this, this.mouseX, this.mouseY);
      } catch (e) {
        /* swallow */
      }
    }
  };
}
