import { supportsPointerEvents } from 'detect-it';
import { Errors, EventType } from '../shared/enums';
import { hasProp, log } from '../shared/utils';
import { emit } from '../app/events';
import { getLink } from '../shared/links';
import { IPage } from '../types/page';
import { observers, pages, selectors } from '../app/session';
import { getAttributes, getKey, getRoute } from '../app/route';
import * as hover from '../observers/hover';
import * as proximity from '../observers/proximity';
import * as intersect from '../observers/intersect';
import * as progress from '../app/progress';
import * as request from '../app/fetch';
import * as render from '../app/render';
import * as store from '../app/store';
import * as history from './history';

/**
 * Handles a clicked link, prevents special click types.
 */
function linkEvent (event: MouseEvent): boolean {

  return !(
    (
      // @ts-ignore
      (event.target && event.target.isContentEditable) ||
      event.defaultPrevented ||
      event.which > 1 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
  );

}

/**
 * Triggers a page fetch
 *
 * Mousedown is interpretended as intent-to-visit, it works like this:
 *
 * 1. We will validate the mousedown event was placed on a valid `<a>` node.
 * 2. We will validate the `href` value, ie: the `key` (pathname + search params).
 * 3. We disconnect all observers to prevent futher requests from occuring.
 * 4. We fire off the `visit` event lifecycle method
 *
 * **Handling in-transit visits**
 *
 * At this point we need to determine the visit status. If the visit has already began,
 * which will have occured in a prefetch, then we do not need to trigger an addition
 * fetch, instead we will await on the initial fetch to complete before passing it to
 * the render cycle.
 *
 * **Handling Sub-sequent visits**
 *
 * If we are dealing with a sub-sequent visit, ie: we are visiting an already cached
 * page, then we simply re-parse attributes of the node and then pass to render.
 *
 * **Handling new visits**
 *
 * If we are dealing with a new-visit, which is a visit that is neither in-transit
 * or sub-sequent then we trigger a fetch and await its completion in the next phase.
 * This is typical for visits with no pre-fetch operation configured.
 *
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleTrigger (event: MouseEvent): void {

  if (!linkEvent(event)) return;

  const target = getLink(event.target, selectors.href);

  // Skip id target is not a valid href element
  if (!target) return;

  const key = getKey(target.href);

  // Skip id href value is not a valid key
  if (key === null) return;

  // Prevent any observers from triggering
  hover.disconnect();
  proximity.disconnect();
  intersect.disconnect();

  // Event lifecycle, cancel if returned false
  if (!emit('visit', event)) return;

  if (hasProp(request.transit, key)) {

    const page = pages[key];

    request.cancel(key);

    target.addEventListener('click', function handle (event: MouseEvent) {
      event.preventDefault();
      target.removeEventListener('click', handle, false);
      return visit(page);
    }, false);

  } else if (store.has(key)) {

    const attrs = getAttributes(target, pages[key]);
    const page = store.update(attrs);

    target.addEventListener('click', function handle (event: MouseEvent) {
      event.preventDefault();
      target.removeEventListener('click', handle, false);
      return render.update(page);
    }, false);

  } else {

    request.cancel();

    const route = getRoute(target, EventType.VISIT);
    const page = store.create(route);

    request.fetch(page);

    target.addEventListener('click', function handle (event: MouseEvent) {
      event.preventDefault();
      target.removeEventListener('click', handle, false);
      return visit(page);
    }, false);
  }
}

export function visit (state: IPage) {

  progress.start(state.progress as number);
  request.wait(state).then(function (page) {

    if (page) {
      history.push(page);
      render.update(page);
    } else {
      location.assign(state.key);
    }

  }).catch(function (error) {

    location.assign(state.key);

    log(Errors.ERROR, error);

  });

}

/**
 * Executes a SPX navigation.
 *
 */
export function navigate (key: string, state?: IPage): void {

  if (state) {

    if (typeof state.cache === 'string') state.cache === 'clear' ? store.clear() : store.clear(state.key);

    // Trigger progress bar loading
    progress.start(state.progress as number);

    request.fetch(state).then(function (page) {

      return page ? render.update(page) : location.assign(state.key);

    });

  } else {

    return visit(pages[key]);

  }

}

/**
 * Attached `click` event listener.
 *
 * @returns {void}
 */
export function connect (): void {

  if (observers.hrefs) return;

  if (supportsPointerEvents) {
    addEventListener('pointerdown', handleTrigger, false);
  } else {
    addEventListener('mousedown', handleTrigger, false);
    addEventListener('touchstart', handleTrigger, false);
  }

  observers.hrefs = true;

}

/**
 * Removed `click` event listener.
 */
export function disconnect (): void {

  if (!observers.hrefs) return;

  if (supportsPointerEvents) {
    removeEventListener('pointerdown', handleTrigger, false);
  } else {
    removeEventListener('mousedown', handleTrigger, false);
    removeEventListener('touchstart', handleTrigger, false);
  }

  observers.hrefs = false;

}
