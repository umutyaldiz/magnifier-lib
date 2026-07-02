import type { ResolvedMagnifierOptions } from './types';

export const DEFAULTS: ResolvedMagnifierOptions = {
  shape: 'circle',

  size: 220,
  width: 360,
  height: 220,

  zoom: 2,

  borderWidth: 3,
  borderColor: 'rgba(255, 255, 255, 0.95)',
  borderStyle: 'solid',
  borderRadius: 8,
  shadow: '0 10px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.15)',
  background: '#ffffff',
  crosshair: false,
  crosshairColor: 'rgba(255,0,0,.6)',

  autoStart: false,
  hideCursor: true,
  smooth: true,
  smoothDuration: 50,
  offsetX: 0,
  offsetY: 0,
  zIndex: 2147483646,
  excludeSelectors: [],

  renderMode: 'canvas',
  refreshIntervalMs: 500,

  keyboardShortcut: 'm',
  shortcutWithCtrl: false,
  shortcutWithAlt: true,
  shortcutWithShift: false,

  onEnable: null,
  onDisable: null,
  onMove: null,
};
