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

  constructor(private readonly onCaptured: () => void) {}

  get isReady(): boolean {
    return this.ready;
  }

  get source(): HTMLCanvasElement | null {
    return this.pageCanvas;
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
  }

  private captureToCanvas(): Promise<void> {
    const pw = window.innerWidth;
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
        const svgStr =
          `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}">` +
          `<foreignObject x="0" y="0" width="${pw}" height="${ph}">` +
          serialized +
          `</foreignObject></svg>`;

        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          if (this.pageCanvas) {
            this.pageCanvas.width = pw;
            this.pageCanvas.height = ph;
            const ctx = this.pageCanvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, pw, ph);
              ctx.drawImage(img, 0, 0, pw, ph);
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
