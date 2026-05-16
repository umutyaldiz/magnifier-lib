/*!
 * Magnifier.js v1.1.0
 * Haber siteleri ve görme zorluğu yaşayan kullanıcılar için
 * mouse takipli, şekil seçilebilir büyüteç kütüphanesi.
 *
 * - Bağımlılıksız (no deps)
 * - ES6 class
 * - Vanilla JS (TypeScript yok)
 * - Canvas snapshot (SVG foreignObject) + DOM clone fallback
 *
 * @license MIT
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.Magnifier = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULTS = {
    // Şekil: 'circle' | 'square' | 'rectangle'
    shape: 'circle',

    // Boyutlar (px)
    size: 220,
    width: 360,
    height: 220,

    // Büyütme oranı
    zoom: 2,

    // Görsel
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderStyle: 'solid',
    borderRadius: 8,
    shadow: '0 10px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.15)',
    background: '#ffffff',
    crosshair: false,
    crosshairColor: 'rgba(255,0,0,.6)',

    // Davranış
    autoStart: false,
    hideCursor: true,
    smooth: true,
    smoothDuration: 50,
    offsetX: 0,
    offsetY: 0,
    zIndex: 2147483646,
    excludeSelectors: [],

    // Render modu:
    //   'canvas' — sayfa SVG foreignObject ile canvas'a yazdırılır, lens içinde
    //              canvas drawImage ile büyütülür. Temiz ve DOM kirletmez.
    //   'clone'  — klasik DOM clone yaklaşımı (cross-origin img varsa daha güvenilir)
    //   'auto'   — canvas destekleniyorsa canvas, değilse clone
    renderMode: 'canvas',

    // Clone/canvas yenileme aralığı (ms)
    refreshIntervalMs: 500,

    // Klavye kısayolu (Alt+M default)
    keyboardShortcut: 'm',
    shortcutWithCtrl: false,
    shortcutWithAlt: true,
    shortcutWithShift: false,

    // Callback'ler
    onEnable: null,
    onDisable: null,
    onMove: null,
  };

  function isEditable(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  class Magnifier {
    constructor(options = {}) {
      this.options = Object.assign({}, DEFAULTS, options);
      this._enabled = false;
      this._renderMode = null;

      // DOM clone mode
      this._lens = null;
      this._inner = null;
      this._clone = null;

      // Canvas mode
      this._lensCanvas = null;
      this._lensCtx = null;
      this._pageCanvas = null;
      this._pageReady = false;
      this._captureInProgress = false;

      this._cursorStyle = null;
      this._mouseX = 0;
      this._mouseY = 0;
      this._rafId = null;
      this._cloneTimer = null;
      this._mo = null;
      this._moPending = false;

      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseLeave = this._onMouseLeave.bind(this);
      this._onMouseEnter = this._onMouseEnter.bind(this);
      this._onScroll = this._onScroll.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onKeyDown = this._onKeyDown.bind(this);
      this._tick = this._tick.bind(this);

      if (this.options.keyboardShortcut) {
        document.addEventListener('keydown', this._onKeyDown, true);
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

    enable() {
      if (this._enabled) return;
      this._enabled = true;

      const rm = this.options.renderMode;
      this._renderMode = rm === 'auto'
        ? (this._supportsCanvas() ? 'canvas' : 'clone')
        : rm;

      this._createLens();

      if (this._renderMode === 'canvas') {
        this._pageCanvas = document.createElement('canvas');
        this._scheduleCapture();
        this._cloneTimer = setInterval(() => this._scheduleCapture(), this.options.refreshIntervalMs);
      } else {
        this._buildClone();
        this._cloneTimer = setInterval(() => this._refreshClone(), this.options.refreshIntervalMs);
      }

      this._injectCursorStyle();

      document.addEventListener('mousemove', this._onMouseMove, { passive: true });
      document.documentElement.addEventListener('mouseleave', this._onMouseLeave);
      document.documentElement.addEventListener('mouseenter', this._onMouseEnter);
      window.addEventListener('scroll', this._onScroll, { passive: true, capture: true });
      window.addEventListener('resize', this._onResize);

      if (typeof MutationObserver !== 'undefined') {
        this._mo = new MutationObserver(() => {
          if (this._moPending) return;
          this._moPending = true;
          setTimeout(() => {
            this._moPending = false;
            if (!this._enabled) return;
            if (this._renderMode === 'canvas') this._scheduleCapture();
            else this._refreshClone();
          }, 200);
        });
        this._mo.observe(document.body, {
          childList: true, subtree: true, characterData: true, attributes: true,
        });
      }

      this._callCallback('onEnable');
    }

    disable() {
      if (!this._enabled) return;
      this._enabled = false;

      document.removeEventListener('mousemove', this._onMouseMove);
      document.documentElement.removeEventListener('mouseleave', this._onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', this._onMouseEnter);
      window.removeEventListener('scroll', this._onScroll, true);
      window.removeEventListener('resize', this._onResize);

      if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
      if (this._cloneTimer) { clearInterval(this._cloneTimer); this._cloneTimer = null; }
      if (this._mo) { this._mo.disconnect(); this._mo = null; }

      this._removeLens();
      this._removeCursorStyle();
      this._callCallback('onDisable');
    }

    toggle() { this._enabled ? this.disable() : this.enable(); }

    isEnabled() { return this._enabled; }

    setOptions(newOptions = {}) {
      const wasEnabled = this._enabled;
      this.options = Object.assign({}, this.options, newOptions);
      if (wasEnabled) { this.disable(); this.enable(); }
    }

    getOptions() { return Object.assign({}, this.options); }

    destroy() {
      this.disable();
      if (this.options.keyboardShortcut) {
        document.removeEventListener('keydown', this._onKeyDown, true);
      }
    }

    /* -------- Private -------- */

    _supportsCanvas() {
      try {
        return !!(
          document.createElement('canvas').getContext &&
          typeof XMLSerializer !== 'undefined' &&
          typeof URL.createObjectURL === 'function'
        );
      } catch (e) { return false; }
    }

    _callCallback(name) {
      const cb = this.options[name];
      if (typeof cb === 'function') { try { cb.call(this); } catch (e) { /* swallow */ } }
    }

    _getLensSize() {
      const opt = this.options;
      if (opt.shape === 'rectangle') return { w: opt.width, h: opt.height };
      return { w: opt.size, h: opt.size };
    }

    _createLens() {
      const opt = this.options;
      const { w, h } = this._getLensSize();
      const radius = opt.shape === 'circle' ? '50%' : (opt.borderRadius + 'px');

      const lens = document.createElement('div');
      lens.setAttribute('aria-hidden', 'true');
      lens.setAttribute('data-magnifier-lens', '');
      Object.assign(lens.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: w + 'px',
        height: h + 'px',
        borderRadius: radius,
        border: `${opt.borderWidth}px ${opt.borderStyle} ${opt.borderColor}`,
        boxShadow: opt.shadow,
        background: opt.background,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: String(opt.zIndex),
        transform: 'translate3d(-9999px,-9999px,0)',
        willChange: 'transform',
        transition: opt.smooth ? `transform ${opt.smoothDuration}ms linear` : 'none',
        display: 'none',
      });

      if (this._renderMode === 'canvas') {
        // Canvas tabanlı render: sayfa snapshot'ı canvas'a yazılır,
        // lens içindeki canvas'a drawImage ile büyütülmüş bölge çizilir.
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        Object.assign(canvas.style, {
          position: 'absolute',
          left: '0', top: '0',
          width: w + 'px', height: h + 'px',
          pointerEvents: 'none',
        });
        lens.appendChild(canvas);
        this._lensCanvas = canvas;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr); // HiDPI — mantıksal koordinatlar kullanılır
        this._lensCtx = ctx;
      } else {
        // DOM clone render: body clone'u inner div içinde scale ile büyütülür
        const inner = document.createElement('div');
        inner.setAttribute('data-magnifier-inner', '');
        Object.assign(inner.style, {
          position: 'absolute',
          left: '0', top: '0',
          width: window.innerWidth + 'px',
          height: window.innerHeight + 'px',
          transformOrigin: '0 0',
          pointerEvents: 'none',
        });
        lens.appendChild(inner);
        this._inner = inner;
      }

      if (opt.crosshair) {
        const ch = document.createElement('div');
        Object.assign(ch.style, {
          position: 'absolute',
          left: '50%', top: '50%',
          width: '10px', height: '10px',
          marginLeft: '-5px', marginTop: '-5px',
          border: `1px solid ${opt.crosshairColor}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: '2',
        });
        lens.appendChild(ch);
      }

      document.body.appendChild(lens);
      this._lens = lens;
    }

    _removeLens() {
      if (this._lens && this._lens.parentNode) {
        this._lens.parentNode.removeChild(this._lens);
      }
      this._lens = null;
      this._inner = null;
      this._clone = null;
      this._lensCanvas = null;
      this._lensCtx = null;
      this._pageCanvas = null;
      this._pageReady = false;
      this._captureInProgress = false;
    }

    /* ---- Canvas mode: SVG foreignObject snapshot ---- */

    _scheduleCapture() {
      if (this._captureInProgress) return;
      this._captureInProgress = true;
      this._captureToCanvas()
        .then(() => { this._captureInProgress = false; })
        .catch(() => { this._captureInProgress = false; });
    }

    _captureToCanvas() {
      const pw = window.innerWidth;
      const ph = document.documentElement.scrollHeight;

      return new Promise((resolve) => {
        try {
          // Tam document clone — <head> dahil (stiller korunur)
          const htmlEl = document.documentElement.cloneNode(true);
          htmlEl.querySelectorAll('[data-magnifier-lens], script, noscript').forEach(el => el.remove());

          // Göreli URL'ler için base href ekle
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

          // SVG foreignObject içine sarılmış HTML → Image → Canvas
          const svgStr =
            `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}">` +
            `<foreignObject x="0" y="0" width="${pw}" height="${ph}">` +
            serialized +
            `</foreignObject></svg>`;

          const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const img = new Image();

          img.onload = () => {
            if (this._pageCanvas) {
              this._pageCanvas.width = pw;
              this._pageCanvas.height = ph;
              const ctx = this._pageCanvas.getContext('2d');
              ctx.clearRect(0, 0, pw, ph);
              ctx.drawImage(img, 0, 0, pw, ph);
              this._pageReady = true;
              // İlk snapshot hazır olunca hemen çiz
              if (!this._rafId) this._rafId = requestAnimationFrame(this._tick);
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

    /* ---- Clone mode (fallback / explicit 'clone') ---- */

    _buildClone() { this._refreshClone(); }

    _refreshClone() {
      if (!this._inner) return;
      try {
        const body = document.body;
        const clone = body.cloneNode(true);
        clone.querySelectorAll('script, noscript, iframe, [data-magnifier-lens]')
          .forEach(el => el.remove());
        Object.assign(clone.style, {
          position: 'absolute',
          left: '0', top: '0',
          width: window.innerWidth + 'px',
          margin: '0',
          padding: getComputedStyle(body).padding,
          pointerEvents: 'none',
        });
        while (this._inner.firstChild) this._inner.removeChild(this._inner.firstChild);
        this._inner.style.width = window.innerWidth + 'px';
        this._inner.style.height = document.documentElement.scrollHeight + 'px';
        clone.style.top = '0px';
        this._inner.appendChild(clone);
        this._clone = clone;
      } catch (e) { /* swallow */ }
    }

    /* ---- Cursor ---- */

    _injectCursorStyle() {
      if (!this.options.hideCursor) return;
      const style = document.createElement('style');
      style.setAttribute('data-magnifier-cursor', '');
      style.textContent =
        'html.magnifier-active, html.magnifier-active *, ' +
        'html.magnifier-active *::before, html.magnifier-active *::after ' +
        '{ cursor: none !important; }';
      document.head.appendChild(style);
      document.documentElement.classList.add('magnifier-active');
      this._cursorStyle = style;
    }

    _removeCursorStyle() {
      document.documentElement.classList.remove('magnifier-active');
      if (this._cursorStyle && this._cursorStyle.parentNode) {
        this._cursorStyle.parentNode.removeChild(this._cursorStyle);
      }
      this._cursorStyle = null;
    }

    /* ---- Event handlers ---- */

    _onMouseMove(e) {
      this._mouseX = e.clientX;
      this._mouseY = e.clientY;

      const excluded = this.options.excludeSelectors;
      if (excluded && excluded.length) {
        const sel = excluded.join(',');
        if (e.target && e.target.closest && e.target.closest(sel)) {
          if (this._lens) this._lens.style.display = 'none';
          return;
        }
      }

      if (!this._rafId) this._rafId = requestAnimationFrame(this._tick);
    }

    _onMouseLeave() { if (this._lens) this._lens.style.display = 'none'; }
    _onMouseEnter() { if (this._lens) this._lens.style.display = 'block'; }

    _onScroll() {
      if (!this._rafId) this._rafId = requestAnimationFrame(this._tick);
    }

    _onResize() {
      if (this._renderMode === 'clone' && this._inner) {
        this._inner.style.width = window.innerWidth + 'px';
        this._refreshClone();
      } else if (this._renderMode === 'canvas') {
        this._scheduleCapture();
      }
      if (!this._rafId) this._rafId = requestAnimationFrame(this._tick);
    }

    _onKeyDown(e) {
      const opt = this.options;
      const key = opt.keyboardShortcut;
      if (!key || !e.key) return;
      if (e.key.toLowerCase() !== String(key).toLowerCase()) return;
      if (isEditable(e.target)) return;

      const ctrlOk = opt.shortcutWithCtrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const altOk  = opt.shortcutWithAlt   ? e.altKey   : !e.altKey;
      const shiftOk = opt.shortcutWithShift ? e.shiftKey : !e.shiftKey;

      if (ctrlOk && altOk && shiftOk) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      }
    }

    /* ---- Render tick ---- */

    _tick() {
      this._rafId = null;
      if (!this._enabled || !this._lens) return;

      const opt = this.options;
      const { w: lensW, h: lensH } = this._getLensSize();

      const lensX = this._mouseX - lensW / 2 + opt.offsetX;
      const lensY = this._mouseY - lensH / 2 + opt.offsetY;

      this._lens.style.display = 'block';
      this._lens.style.transform = `translate3d(${lensX}px, ${lensY}px, 0)`;

      if (this._renderMode === 'canvas' && this._lensCtx && this._pageCanvas && this._pageReady) {
        // Canvas modu: sayfa snapshot'ından büyütülmüş bölgeyi lens canvas'ına kopyala.
        // drawImage'ın kaynak→hedef ölçeklemesi doğal zoom sağlar — CSS transform gereksiz.
        const z = opt.zoom;
        const srcW = lensW / z;
        const srcH = lensH / z;
        const srcX = this._mouseX - srcW / 2;
        const srcY = this._mouseY + window.scrollY - srcH / 2;

        // Sayfa canvas sınırlarına sabitle
        const maxX = this._pageCanvas.width - srcW;
        const maxY = this._pageCanvas.height - srcH;
        const cx = Math.max(0, Math.min(srcX, maxX));
        const cy = Math.max(0, Math.min(srcY, maxY));

        this._lensCtx.clearRect(0, 0, lensW, lensH);
        this._lensCtx.drawImage(this._pageCanvas, cx, cy, srcW, srcH, 0, 0, lensW, lensH);

      } else if (this._renderMode !== 'canvas' && this._inner) {
        // Clone modu: DOM clone'u CSS transform ile büyüt
        const z = opt.zoom;
        const tx = -(this._mouseX * z) + lensW / 2;
        const ty = -((this._mouseY + window.scrollY) * z) + lensH / 2;
        this._inner.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`;
      }

      if (typeof opt.onMove === 'function') {
        try { opt.onMove(this._mouseX, this._mouseY); } catch (e) { /* swallow */ }
      }
    }
  }

  Magnifier.version = '1.1.0';
  return Magnifier;
}));
