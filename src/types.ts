export type MagnifierShape = 'circle' | 'square' | 'rectangle';
export type MagnifierRenderMode = 'canvas' | 'clone' | 'auto';

export interface MagnifierOptions {
  /** Lens shape. @default 'circle' */
  shape?: MagnifierShape;
  /** Diameter/side length in px, used for 'circle' and 'square'. @default 220 */
  size?: number;
  /** Width in px, used for 'rectangle'. @default 360 */
  width?: number;
  /** Height in px, used for 'rectangle'. @default 220 */
  height?: number;
  /** Magnification factor. @default 2 */
  zoom?: number;
  /** Lens border width in px. @default 3 */
  borderWidth?: number;
  /** Lens border color (any CSS color). @default 'rgba(255, 255, 255, 0.95)' */
  borderColor?: string;
  /** CSS border-style. @default 'solid' */
  borderStyle?: string;
  /** Corner radius in px, used for 'square'/'rectangle'. @default 8 */
  borderRadius?: number;
  /** CSS box-shadow for the lens. */
  shadow?: string;
  /** Lens background color, shown before content is captured. @default '#ffffff' */
  background?: string;
  /** Show a crosshair dot at the lens center. @default false */
  crosshair?: boolean;
  /** Crosshair color. @default 'rgba(255,0,0,.6)' */
  crosshairColor?: string;
  /** Enable the magnifier as soon as it is constructed. @default false */
  autoStart?: boolean;
  /** Hide the native cursor while the magnifier is active. @default true */
  hideCursor?: boolean;
  /** Animate lens position with a CSS transition. @default true */
  smooth?: boolean;
  /** Duration of the smooth transition in ms. @default 50 */
  smoothDuration?: number;
  /** Horizontal offset of the lens relative to the cursor, in px. @default 0 */
  offsetX?: number;
  /** Vertical offset of the lens relative to the cursor, in px. @default 0 */
  offsetY?: number;
  /** z-index applied to the lens element. @default 2147483646 */
  zIndex?: number;
  /** CSS selectors under which the lens is hidden (e.g. ad slots). @default [] */
  excludeSelectors?: string[];
  /**
   * Capture strategy:
   * - 'canvas': page is snapshotted into a <canvas> via an SVG foreignObject; no DOM clone.
   * - 'clone': the page DOM is cloned and scaled with a CSS transform.
   * - 'auto': uses 'canvas' when supported, otherwise falls back to 'clone'.
   * @default 'canvas'
   */
  renderMode?: MagnifierRenderMode;
  /** Interval in ms between page snapshots/clone refreshes. @default 500 */
  refreshIntervalMs?: number;
  /** Key that toggles the magnifier; set to false to disable the shortcut. @default 'm' */
  keyboardShortcut?: string | false;
  /** Require Ctrl/Cmd for the shortcut. @default false */
  shortcutWithCtrl?: boolean;
  /** Require Alt for the shortcut. @default true */
  shortcutWithAlt?: boolean;
  /** Require Shift for the shortcut. @default false */
  shortcutWithShift?: boolean;
  /** Called after the magnifier is enabled. */
  onEnable?: (() => void) | null;
  /** Called after the magnifier is disabled. */
  onDisable?: (() => void) | null;
  /** Called on every lens position update with viewport coordinates. */
  onMove?: ((x: number, y: number) => void) | null;
}

export type ResolvedMagnifierOptions = Required<MagnifierOptions>;
