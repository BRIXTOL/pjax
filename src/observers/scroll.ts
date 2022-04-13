import { IPosition } from '../types/page';
import * as state from '../app/state';
import { create } from '../constants/native';

/**
 * Returns to current scroll position, the `reset()`
 * function **MUST** be called after referencing this
 * to reset position.
 */
let ticking: boolean = false;

/**
 * Set the current scroll position offset
 * and update the X and Y page references.
 */
export function position (): IPosition {

  return state.position;

}

/**
 * onScroll event, asserts the current X and Y page
 * offset position of the document
 */
export function onscroll (): void {

  state.position.y = window.scrollY;
  state.position.x = window.scrollX;

  if (!ticking) {
    requestAnimationFrame(position);
    ticking = true;
  }

}

/**
 * Resets the scroll position of the document, applying
 * a `x`and `y` positions to `0`
 */
export function reset (): IPosition {

  ticking = false;

  state.position.x = 0;
  state.position.y = 0;

  return state.position;

}

/**
 * Returns a faux scroll position. This prevents the
 * tracked scroll position from being overwritten and is
 * used within functions like `href.attrparse`
 */
export function y0x0 (): IPosition {

  const position = create(null);

  position.x = 0;
  position.y = 0;

  return position;

}

/**
 * Attached `scroll` event listener.
 */
export function start (): void {

  if (state.connect.has(6)) return;

  onscroll();
  addEventListener('scroll', onscroll, { passive: true });
  state.connect.add(6);

}

/**
 * Removed `scroll` event listener.
 */
export function stop (): void {

  if (!state.connect.has(6)) return;

  removeEventListener('scroll', onscroll, false);
  reset();
  state.connect.delete(6);

}
