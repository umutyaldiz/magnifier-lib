# Magnifier.js

Haber siteleri ve görme zorluğu çeken kullanıcılar için **mouse takipli, şekil seçilebilir** bir büyüteç kütüphanesi.

- ⚙️ Bağımlılıksız, vanilla JS, ES6 class
- 🎯 Mouse cursor'u takip eder; isteğe bağlı cursor gizleme
- 🔵 Daire / kare / dikdörtgen şekil
- 🎚️ Runtime'da `setOptions()` ile her şey değiştirilebilir
- ⌨️ Klavye kısayolu (default: `Alt + M`)
- 🔁 Buton ile veya `autoStart: true` ile otomatik aktif
- 📰 Haber sitelerinin reklam/ad-slot alanları için `excludeSelectors` desteği

## Kurulum

```html
<script src="dist/magnifier.js"></script>
```

veya bir bundler ile:

```js
import Magnifier from './dist/magnifier.js';
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

| Seçenek | Tip | Default | Açıklama |
|---|---|---|---|
| `shape` | `'circle' \| 'square' \| 'rectangle'` | `'circle'` | Büyüteç şekli |
| `size` | `number` | `220` | `circle` ve `square` için çap/kenar (px) |
| `width` | `number` | `360` | `rectangle` için genişlik |
| `height` | `number` | `220` | `rectangle` için yükseklik |
| `zoom` | `number` | `2` | Büyütme oranı |
| `borderWidth` | `number` | `3` | Kenar kalınlığı |
| `borderColor` | `string` | `rgba(255,255,255,.95)` | Kenar rengi |
| `borderStyle` | `string` | `'solid'` | CSS border-style |
| `borderRadius` | `number` | `8` | square/rectangle köşe yumuşatma |
| `shadow` | `string` | `'0 10px 40px ...'` | CSS box-shadow |
| `background` | `string` | `'#ffffff'` | Lens arkaplanı |
| `crosshair` | `boolean` | `false` | Merkezde nokta göstergesi |
| `crosshairColor` | `string` | `rgba(255,0,0,.6)` | Crosshair rengi |
| `autoStart` | `boolean` | `false` | Sayfa yüklenince otomatik aç |
| `hideCursor` | `boolean` | `true` | Sayfa cursor'unu gizle |
| `smooth` | `boolean` | `true` | Yumuşak hareket |
| `smoothDuration` | `number` | `50` | Transition süresi (ms) |
| `offsetX` / `offsetY` | `number` | `0` | Lens'in cursor'a göre ofseti |
| `zIndex` | `number` | `2147483646` | Lens z-index |
| `excludeSelectors` | `string[]` | `[]` | Bu seçicilerin üzerinde lens gizlenir (örn. `['.ad-slot', '.video-ad']`) |
| `refreshIntervalMs` | `number` | `200` | DOM clone yenileme aralığı (ms) |
| `keyboardShortcut` | `string \| false` | `'m'` | Toggle için tuş; `false` ile kapatılır |
| `shortcutWithCtrl` | `boolean` | `false` | Ctrl/Cmd gereksin mi |
| `shortcutWithAlt` | `boolean` | `true` | Alt gereksin mi |
| `shortcutWithShift` | `boolean` | `false` | Shift gereksin mi |
| `onEnable` | `function` | `null` | Aktif olunca |
| `onDisable` | `function` | `null` | Kapanınca |
| `onMove` | `function` | `null` | `(x, y)` mouse koordinatları |

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

## Haber Sitesi Senaryosu

```js
const mag = new Magnifier({
  shape: 'circle',
  size: 240,
  zoom: 2.2,
  autoStart: false,
  excludeSelectors: ['.ad-slot', '.gpt-ad', '.video-player', '[data-ad]'],
  keyboardShortcut: 'm',
  shortcutWithAlt: true,
});

// Erişilebilirlik menüsünden açma
document.querySelector('#accessibility-magnifier-toggle')
  .addEventListener('click', () => mag.toggle());
```

## Notlar / Sınırlamalar

- Lens, sayfanın **DOM clone'u** üzerinde scale uygular. Bu yöntem text/görsel/SVG için canlı sonuç verir; ancak `<canvas>` ve cross-origin `<iframe>` içerikleri büyütmeli görünüm içinde gözükmeyebilir. Bu, haber sitelerinin makale içeriği için sorun değildir.
- `refreshIntervalMs` çok düşürülürse CPU kullanımı artar; varsayılan 200ms uygundur.
- Klavye kısayolu yazı alanlarında (input/textarea/contenteditable) tetiklenmez.

## Lisans

MIT
