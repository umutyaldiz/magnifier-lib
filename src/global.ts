// Entry point for the CDN / plain <script> bundle. Deliberately has no
// exports of its own (see tsup.config.ts) — it just assigns the class to
// `window.Magnifier` as a side effect, so `<script src=".../magnifier.global.js">`
// followed by `new Magnifier(...)` works with no bundler and no `.default`.
import { Magnifier } from './Magnifier';

declare global {
  interface Window {
    Magnifier: typeof Magnifier;
  }
}

window.Magnifier = Magnifier;
