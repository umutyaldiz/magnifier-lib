/**
 * Snapshots the page into an off-screen <canvas> by serializing the current
 * document into an SVG `foreignObject`, rasterizing that through an <img>,
 * and drawing the result into the canvas. This avoids creating a second DOM
 * tree inside the lens — the lens just `drawImage`s a region of this canvas.
 */
export class CanvasCapture {
  private pageCanvas: HTMLCanvasElement | null = null;
  private ready = false;
  private inProgress = false;

  // Device pixels per logical (CSS) page pixel, measured from the actual
  // rasterized snapshot rather than assumed — see captureToCanvas().
  private scaleX = 1;
  private scaleY = 1;

  constructor(private readonly onCaptured: () => void) {}

  get isReady(): boolean {
    return this.ready;
  }

  get source(): HTMLCanvasElement | null {
    return this.pageCanvas;
  }

  get scale(): { x: number; y: number } {
    return { x: this.scaleX, y: this.scaleY };
  }

  init(): void {
    this.pageCanvas = document.createElement('canvas');
  }

  schedule(): void {
    if (this.inProgress) return;
    this.inProgress = true;
    this.captureToCanvas()
      .then(() => {
        this.inProgress = false;
      })
      .catch(() => {
        this.inProgress = false;
      });
  }

  destroy(): void {
    this.pageCanvas = null;
    this.ready = false;
    this.inProgress = false;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  private captureToCanvas(): Promise<void> {
    // clientWidth (not innerWidth) — innerWidth includes the scrollbar, which
    // would make the snapshot's containing block wider than the live page's
    // actual content width and shift centered/fluid layouts to the right.
    const pw = document.documentElement.clientWidth;
    const ph = document.documentElement.scrollHeight;

    return new Promise((resolve) => {
      try {
        // Full document clone — <head> included so styles are preserved.
        const htmlEl = document.documentElement.cloneNode(true) as HTMLElement;
        htmlEl.querySelectorAll('[data-magnifier-lens], script, noscript').forEach((el) => el.remove());

        // Add a <base> for relative URLs.
        const head = htmlEl.querySelector('head');
        if (head) {
          let base = htmlEl.querySelector('base');
          if (!base) {
            base = document.createElement('base');
            base.href = document.baseURI || location.href;
            head.insertBefore(base, head.firstChild);
          }
        }

        const serialized = new XMLSerializer().serializeToString(htmlEl);

        // HTML wrapped in an SVG foreignObject → Image → Canvas.
        //
        // `width`/`height` on the outer <svg> request the actual raster
        // resolution (device pixels, for crisp HiDPI output); `viewBox`
        // keeps the foreignObject's own coordinate system in logical CSS
        // pixels (matching `pw`/`ph`, i.e. the live page's real layout
        // width) so the embedded page reflows identically to how it
        // renders on screen — not wider/narrower, which would silently
        // shift where content ends up relative to the cursor.
        const dpr = window.devicePixelRatio || 1;
        const rasterW = Math.round(pw * dpr);
        const rasterH = Math.round(ph * dpr);
        const svgStr =
          `<svg xmlns="http://www.w3.org/2000/svg" width="${rasterW}" height="${rasterH}" viewBox="0 0 ${pw} ${ph}">` +
          `<foreignObject x="0" y="0" width="${pw}" height="${ph}">` +
          serialized +
          `</foreignObject></svg>`;

        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          if (this.pageCanvas) {
            // Never assume the browser rasterized at exactly rasterW×rasterH —
            // measure it and draw 1:1. Force-stretching a mismatched source
            // into a fixed size (the previous approach) silently distorts the
            // scale, which is what was throwing the lens sampling off.
            const naturalW = img.naturalWidth || rasterW;
            const naturalH = img.naturalHeight || rasterH;
            this.pageCanvas.width = naturalW;
            this.pageCanvas.height = naturalH;
            this.scaleX = naturalW / pw;
            this.scaleY = naturalH / ph;
            const ctx = this.pageCanvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, naturalW, naturalH);
              ctx.drawImage(img, 0, 0, naturalW, naturalH);
            }
            this.ready = true;
            this.onCaptured();
          }
          URL.revokeObjectURL(url);
          resolve();
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        img.src = url;
      } catch (e) {
        resolve();
      }
    });
  }
}
