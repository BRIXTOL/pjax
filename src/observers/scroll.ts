import { IPosition } from '../types/page';
import { observers } from '../app/session';
import { object } from '../shared/native';

/**
 * Position
 *
 * Holds the current position page offset radius.
 * The scroll position is updated and saved here.
 */
const pos: IPosition = object(null);

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

  return pos;

}

/**
 * onScroll event, asserts the current X and Y page
 * offset position of the document
 */
export function scroll (): void {

  pos.y = window.scrollY;
  pos.x = window.scrollX;

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

  pos.x = 0;
  pos.y = 0;

  return pos;

}

/**
 * Attached `scroll` event listener.
 */
export function connect (): void {

  if (observers.scroll) return;

  addEventListener('scroll', scroll, { passive: true });

  observers.scroll = true;

}

/**
 * Removed `scroll` event listener.
 */
export function disconnect (): void {

  if (!observers.scroll) return;

  removeEventListener('scroll', onscroll, false);
  reset();

  observers.scroll = false;

}
