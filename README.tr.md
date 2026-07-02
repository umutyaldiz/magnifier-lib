🇹🇷 **Türkçe** · [🇬🇧 English](README.md)

# a11y-magnifier

**Bağımlılıksız, mouse takipli büyüteç (magnifier) widget'ı.**
Haber siteleri ve metin ağırlıklı sayfalarda görme zorluğu yaşayan kullanıcılar için tasarlandı — tek bir script etiketiyle eklenir, build adımı ya da framework gerektirmez.

[![npm version](https://img.shields.io/npm/v/a11y-magnifier.svg)](https://www.npmjs.com/package/a11y-magnifier)
[![license: MIT](https://img.shields.io/npm/l/a11y-magnifier.svg)](LICENSE)
[![no dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/a11y-magnifier)](https://bundlephobia.com/package/a11y-magnifier)

**[📖 Canlı Storybook demosu — tüm seçenekleri deneyin](https://umutyaldiz.github.io/magnifier-lib/)**

## Neden bu proje var?

Görme zorluğu yaşayan kullanıcılar, web'in büyük ve genelde göz ardı edilen bir kesimi; çoğu site tarayıcının kendi zoom özelliği dışında bir büyütme seçeneği sunmuyor — o da sayfa düzenini bozup okunan noktayı kaybettiriyor. Alternatif genelde pahalı bir SaaS overlay widget'ı oluyor. Bu kütüphane, ücretsiz ve açık olan orta yol: imleci takip eden, metni net tutan ve build sürecine dahi müdahale etmeden tek satırla herhangi bir sayfaya eklenebilen bir büyüteç.

Tam bir erişilebilirlik denetiminin yerini tutmaz, ama imleç odaklı bir büyüteç bugün görme zorluğu yaşayan kullanıcılar için somut bir fayda sağlar — ve her site, satın alma sürecine girmeden bunu ekleyebilmeli.

## Özellikler

- ⚙️ Sıfır runtime bağımlılığı, TypeScript ile yazıldı, minified ~11 KB
- 🎯 Mouse cursor'unu takip eder; isteğe bağlı olarak aktifken native cursor'u gizler
- 🔵 Daire, kare veya dikdörtgen lens şekli
- 🖼️ Varsayılan olarak canvas tabanlı render (SVG `foreignObject` snapshot → `<canvas>`) — canlı DOM'a dokunmaz, GPU hızlandırmalı `drawImage` ile büyütür
- 🎚️ Her seçenek `setOptions()` ile runtime'da anlık değiştirilebilir
- ⌨️ Yapılandırılabilir klavye kısayolu (varsayılan `Alt+M`)
- 🔁 Bir butondan tetiklenebilir veya `autoStart: true` ile otomatik açılır
- 📰 `excludeSelectors` ile reklam alanları, video oynatıcılar veya belirttiğiniz herhangi bir bölgede lens gizlenir
- 📝 Tip tanımları (`dist/magnifier.d.ts`) doğrudan kaynak koddan otomatik üretilir — ayrı bir `@types` paketine gerek yok
- 📚 Her constructor seçeneğini kapsayan, tamamen interaktif bir Storybook

## Kurulum

```bash
npm install a11y-magnifier
```

```js
// CommonJS
const Magnifier = require('a11y-magnifier');

// ESM / bundler'lar (webpack, Vite, Rollup, Next.js, ...)
import Magnifier from 'a11y-magnifier';
```

Ya da hiç build adımına gerek kalmadan doğrudan CDN'den yükleyin — bu bundle herhangi bir modül formatına ihtiyaç duymaz, sadece `window.Magnifier`'ı tanımlar:

```html
<script src="https://cdn.jsdelivr.net/npm/a11y-magnifier/dist/magnifier.global.min.js"></script>
<script>
  const mag = new Magnifier({ shape: 'circle', zoom: 2 });
  mag.enable();
</script>
```

## Hızlı Kullanım

```js
// Buton kontrolü
const mag = new Magnifier({ shape: 'circle', size: 220, zoom: 2 });
document.getElementById('magBtn').addEventListener('click', () => mag.toggle());

// Sayfa açılır açılmaz aktif
new Magnifier({ autoStart: true, shape: 'circle', zoom: 2.5 });
```

## API

### `new Magnifier(options)`

| Seçenek | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `shape` | `'circle' \| 'square' \| 'rectangle'` | `'circle'` | Büyüteç şekli |
| `size` | `number` | `220` | `circle` ve `square` için çap/kenar (px) |
| `width` | `number` | `360` | `rectangle` için genişlik |
| `height` | `number` | `220` | `rectangle` için yükseklik |
| `zoom` | `number` | `2` | Büyütme oranı |
| `borderWidth` | `number` | `3` | Kenar kalınlığı |
| `borderColor` | `string` | `rgba(255,255,255,.95)` | Kenar rengi |
| `borderStyle` | `string` | `'solid'` | CSS `border-style` |
| `borderRadius` | `number` | `8` | square/rectangle köşe yumuşatma |
| `shadow` | `string` | `'0 10px 40px ...'` | CSS `box-shadow` |
| `background` | `string` | `'#ffffff'` | Lens arkaplanı |
| `crosshair` | `boolean` | `false` | Merkezde nokta göstergesi |
| `crosshairColor` | `string` | `rgba(255,0,0,.6)` | Crosshair rengi |
| `autoStart` | `boolean` | `false` | Sayfa yüklenince otomatik aç |
| `hideCursor` | `boolean` | `true` | Sayfa cursor'unu gizle |
| `smooth` | `boolean` | `true` | Yumuşak hareket |
| `smoothDuration` | `number` | `50` | Transition süresi (ms) |
| `offsetX` / `offsetY` | `number` | `0` | Lens'in cursor'a göre ofseti |
| `zIndex` | `number` | `2147483646` | Lens z-index |
| `renderMode` | `'canvas' \| 'clone' \| 'auto'` | `'canvas'` | Render yöntemi (aşağıya bakın) |
| `excludeSelectors` | `string[]` | `[]` | Bu seçicilerin üzerinde lens gizlenir (örn. `['.ad-slot', '.video-ad']`) |
| `refreshIntervalMs` | `number` | `500` | Snapshot/clone yenileme aralığı (ms) |
| `keyboardShortcut` | `string \| false` | `'m'` | Toggle için tuş; `false` ile kapatılır |
| `shortcutWithCtrl` | `boolean` | `false` | Ctrl/Cmd gereksin mi |
| `shortcutWithAlt` | `boolean` | `true` | Alt gereksin mi |
| `shortcutWithShift` | `boolean` | `false` | Shift gereksin mi |
| `onEnable` | `function` | `null` | Aktif olunca çağrılır |
| `onDisable` | `function` | `null` | Kapanınca çağrılır |
| `onMove` | `function` | `null` | `(x, y)` mouse koordinatlarıyla çağrılır |

### `renderMode` seçeneği

| Değer | Açıklama |
|---|---|
| `'canvas'` | Sayfa, SVG `foreignObject` aracılığıyla bir `<canvas>` snapshot'ına yazdırılır. Lens içinde ikinci bir DOM ağacı oluşmaz; büyütme `drawImage` ile GPU hızlandırmalı yapılır. **Önerilen.** |
| `'clone'` | `document.body` klonlanarak lens içine yerleştirilir ve CSS `transform: scale()` ile büyütülür. Cross-origin görsel içeren sayfalarda daha güvenilir. |
| `'auto'` | `canvas` destekleniyorsa canvas, değilse clone kullanılır. |

### Metodlar

| Metod | Açıklama |
|---|---|
| `.enable()` | Büyüteci aç |
| `.disable()` | Büyüteci kapat |
| `.toggle()` | Aç/kapat |
| `.isEnabled()` | Açık mı? |
| `.setOptions(opts)` | Runtime'da seçenekleri güncelle |
| `.getOptions()` | Mevcut seçenekleri döner |
| `.destroy()` | Tüm event listener'ları kaldır |

### Klavye kısayolları

| Kısayol | Eylem |
|---|---|
| `Alt + M` | Büyüteci aç/kapat (varsayılan) |
| `Esc` | *(yerleşik değil — kendiniz bağlayın, aşağıya bakın)* |

Kısayol; input, textarea veya contenteditable bir öğeye odaklanılmışken tetiklenmez.

## Gerçek senaryo: haber sitesi

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

// Erişilebilirlik menüsünden açma
document.querySelector('#accessibility-magnifier-toggle')
  .addEventListener('click', () => mag.toggle());

// İsteğe bağlı: Esc ile de kapatılabilsin
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mag.isEnabled()) mag.disable();
});
```

## Notlar / Sınırlamalar

- **Canvas modu (varsayılan):** Sayfa içeriği SVG `foreignObject` ile bir canvas'a yazdırılır; lens içinde ikinci bir DOM ağacı oluşmaz. `drawImage` ile büyütme GPU hızlandırmalıdır. Cross-origin `<img>` veya `<iframe>` öğeleri snapshot'a dahil edilemez (tarayıcı güvenlik kısıtlaması); bu durum haber sitelerinin kendi makale içeriği için nadiren sorun çıkarır.
- **Clone modu:** Sayfanın DOM clone'u üzerinde CSS scale uygular. `<canvas>` ve cross-origin `<iframe>` içerikleri bu modda da büyütülmüş görünmeyebilir. Cross-origin görseller sunuyorsanız bu mod tercih edilebilir.
- `refreshIntervalMs` çok düşürülürse CPU kullanımı artar; varsayılan 500ms çoğu sayfa için uygundur.
- Klavye kısayolu input/textarea/contenteditable alanlarında hiçbir zaman tetiklenmez.

## Geliştirme

Kaynak kod TypeScript'tir (`src/`), [tsup](https://tsup.egoist.dev) ile dört `dist/` bundle'ına derlenir: `magnifier.js` (CJS), `magnifier.mjs` (ESM), `magnifier.global.js` / `magnifier.global.min.js` (IIFE, `window.Magnifier`'ı tanımlar — yukarıdaki CDN örneğinde kullanılan budur), ve otomatik üretilen `.d.ts` tipleri.

```bash
npm install
npm run storybook         # interaktif oyun alanı — her seçenek, canlı
npm run typecheck         # tsc --noEmit
npm run build              # yukarıda açıklanan dist/ bundle'larını üretir
npm run build-storybook    # statik Storybook build'i (CI/Pages deploy'da kullanılır)
```

Katkılar, issue'lar ve fikirler memnuniyetle karşılanır — GitHub üzerinden bir PR ya da issue açabilirsiniz.

## Lisans

MIT © [Umut Yaldız](https://github.com/umutyaldiz)

## Yazar

**Umut Yaldız** — [github.com/umutyaldiz](https://github.com/umutyaldiz)
