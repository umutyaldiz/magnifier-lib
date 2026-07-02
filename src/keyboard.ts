import type { ResolvedMagnifierOptions } from './types';
import { isEditable } from './utils/isEditable';

export function matchesShortcut(e: KeyboardEvent, options: ResolvedMagnifierOptions): boolean {
  const key = options.keyboardShortcut;
  if (!key || !e.key) return false;
  if (e.key.toLowerCase() !== String(key).toLowerCase()) return false;
  if (isEditable(e.target as Element | null)) return false;

  const ctrlOk = options.shortcutWithCtrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
  const altOk = options.shortcutWithAlt ? e.altKey : !e.altKey;
  const shiftOk = options.shortcutWithShift ? e.shiftKey : !e.shiftKey;

  return ctrlOk && altOk && shiftOk;
}
