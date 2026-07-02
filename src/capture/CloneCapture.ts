/**
 * Fallback/explicit 'clone' render strategy: clones `document.body` into the
 * lens's inner element and lets the caller scale it with a CSS transform.
 * Used when cross-origin images make the canvas snapshot unreliable.
 */
export class CloneCapture {
  constructor(private readonly inner: HTMLDivElement) {}

  build(): void {
    this.refresh();
  }

  refresh(): void {
    try {
      const body = document.body;
      const clone = body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script, noscript, iframe, [data-magnifier-lens]').forEach((el) => el.remove());
      Object.assign(clone.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        width: `${window.innerWidth}px`,
        margin: '0',
        padding: getComputedStyle(body).padding,
        pointerEvents: 'none',
      });
      while (this.inner.firstChild) this.inner.removeChild(this.inner.firstChild);
      this.inner.style.width = `${window.innerWidth}px`;
      this.inner.style.height = `${document.documentElement.scrollHeight}px`;
      clone.style.top = '0px';
      this.inner.appendChild(clone);
    } catch (e) {
      /* swallow */
    }
  }
}
