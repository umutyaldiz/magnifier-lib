// Hiding the native cursor requires a global rule (`*` under a marker class) —
// this is the one place the library touches page-wide CSS instead of inline
// styles, so it is kept isolated in its own module.
export function injectCursorStyle(): HTMLStyleElement {
  const style = document.createElement('style');
  style.setAttribute('data-magnifier-cursor', '');
  style.textContent =
    'html.magnifier-active, html.magnifier-active *, ' +
    'html.magnifier-active *::before, html.magnifier-active *::after ' +
    '{ cursor: none !important; }';
  document.head.appendChild(style);
  document.documentElement.classList.add('magnifier-active');
  return style;
}

export function removeCursorStyle(style: HTMLStyleElement | null): void {
  document.documentElement.classList.remove('magnifier-active');
  if (style && style.parentNode) {
    style.parentNode.removeChild(style);
  }
}
