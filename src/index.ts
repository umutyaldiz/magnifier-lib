import { Magnifier } from './Magnifier';

// No named runtime export alongside `default` on purpose — it lets the build
// (see tsup.config.ts's `cjsInterop`) make `require('a11y-magnifier')` return
// the class directly, matching the old UMD file's ergonomics.
export default Magnifier;
export type { MagnifierOptions, MagnifierShape, MagnifierRenderMode, ResolvedMagnifierOptions } from './types';
