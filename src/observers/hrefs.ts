import { supportsPointerEvents } from 'detect-it';
import { emit } from '../app/events';
import { getLink } from '../app/utils';
import { keys } from '../constants/native';
import { IPage } from '../types/page';
import { connect, schema, pages, transit } from '../app/state';
import { getRoute } from '../app/route';
import * as request from '../app/request';
import * as render from '../app/render';
import * as store from '../app/store';
import * as history from './history';
import { EventType } from '../constants/enums';

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
 * Triggers click events
 *
 * @param {Element} target
 */
function onClick (target: Element, state: string | IPage) {

  return function handle (event: MouseEvent): void | IPage | Promise<void | IPage> {

    event.preventDefault();
    target.removeEventListener('click', handle, false);
    history.update();

    if (typeof state === 'object') return render.update(state);
    if (typeof state === 'string') return navigate(state);

    return location.assign(state);

  };
}

/**
 * Triggers a page fetch
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleTrigger (event: MouseEvent): void {

  if (!linkEvent(event)) return;

  const target = getLink(event.target, schema.href);

  if (!target) return;

  const route = getRoute(target);

  if (!emit('trigger', event, route)) return;

  // CACHED VISIT
  if (store.has(route.key)) {

    // UPDATE ANY REFERENCES OF ATTRIBUTE
    target.addEventListener('click', onClick(target, store.update(route)), false);

  } else {

    // CANCEL PENDING REQUESTS
    if (route.key in transit) {
      if (keys(transit).length > 1) request.cancel(route.key);
    }

    // TRIGGERS FETCH
    request.get(store.create(route), EventType.TRIGGER);

    // WAIT FOR CLICK
    target.addEventListener('click', onClick(target, route.key), false);

  }
}

/**
 * Executes a pjax navigation.
 */
export async function navigate (urlOrState: string, state: IPage | false = false): Promise<void|IPage> {

  if (state) {

    if (typeof state.cache === 'string' && !state.hydrate) {
      state.cache === 'clear' ? store.clear() : store.clear(state.key);
    }

    const page = await request.get(state, EventType.TRIGGER);

    if (page) return render.update(page);

  } else {

    if ((await request.inFlight(urlOrState))) {
      return render.update(pages[urlOrState]);
    } else {
      request.abort(urlOrState);
    }

  }

  return location.assign(urlOrState);

}

/**
 * Attached `click` event listener.
 *
 * @returns {void}
 */
export function start (): void {

  if (connect.has(3)) return;

  if (supportsPointerEvents) {
    addEventListener('pointerdown', handleTrigger, false);
  } else {
    addEventListener('mousedown', handleTrigger, false);
    addEventListener('touchstart', handleTrigger, false);
  }

  connect.add(3);

}

/**
 * Removed `click` event listener.
 */
export function stop (): void {

  if (!connect.has(3)) return;

  if (supportsPointerEvents) {
    removeEventListener('pointerdown', handleTrigger, false);
  } else {
    removeEventListener('mousedown', handleTrigger, false);
    removeEventListener('touchstart', handleTrigger, false);
  }

  connect.delete(3);

}
