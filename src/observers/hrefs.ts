import { supportsPointerEvents } from 'detect-it';
import { dispatchEvent } from '../app/events';
import { getLink, attrparse } from '../app/utils';
import { y0x0 } from './scroll';
import { updateState } from './history';
import { IPage } from '../types/page';
import { connect } from '../app/connects';
import * as store from '../app/store';
import * as path from '../app/path';
import * as request from '../app/request';
import * as render from '../app/render';

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
function handleClick (
  target: Element
): (
  state: any
) => (
  event: MouseEvent
) => void | Promise<void | IPage> {

  return (state: any) => function click (event: MouseEvent): void | Promise<void | IPage> {

    event.preventDefault();
    target.removeEventListener('click', click, false);
    render.capture(updateState()); // PRESERVE CURRENT PAGE

    return typeof state === 'object'
      ? render.update(state) as IPage
      : typeof state === 'string'
        ? navigate(state) as any
        : location.assign(path.url) as void;
  };
}

/**
 * Triggers a page fetch
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleTrigger (event: MouseEvent): void {

  if (!linkEvent(event)) return undefined;

  const target = getLink(event.target, store.config.session.clicks);

  if (!target) return undefined;

  if (dispatchEvent('pjax:trigger', { target }, true)) {

    const { url, location } = path.get(target, true);
    const click = handleClick(target);

    if (request.transit.has(url)) {

      target.addEventListener('click', click(url), false);

    } else {

      const state = attrparse(target, { url, location, position: y0x0() });

      if (store.has(url)) {
        const page = store.pages.update(state.url, state);
        target.addEventListener('click', click(page), false);
      } else {
        request.get(state); // TRIGGERS FETCH
        target.addEventListener('click', click(url), false);
      }
    }
  }
}

/**
 * Executes a pjax navigation.
 */
export async function navigate (
  url: string,
  state: IPage | false = false
): Promise<void|IPage> {

  if (state) {

    if (typeof state.cache === 'string') {
      if (!state.hydrate) state.cache === 'clear' ? store.clear() : store.clear(url);
    }

    const page = await request.get(state);

    if (page) return render.update(page);

  } else {

    if (await request.inFlight(url)) {
      return render.update(store.pages.get(url));
    } else {
      request.cancel(url);
    }

  }

  return location.assign(url);

}

/**
 * Attached `click` event listener.
 *
 * @returns {void}
 */
export function start (): void {

  if (!connect.href) {

    if (supportsPointerEvents) {
      addEventListener('pointerdown', handleTrigger, false);
    } else {
      addEventListener('mousedown', handleTrigger, false);
      addEventListener('touchstart', handleTrigger, false);
    }

    connect.href = true;

  }
}

/**
 * Removed `click` event listener.
 */
export function stop (): void {

  if (connect.href) {

    if (supportsPointerEvents) {
      removeEventListener('pointerdown', handleTrigger, false);
    } else {
      removeEventListener('mousedown', handleTrigger, false);
      removeEventListener('touchstart', handleTrigger, false);
    }

    connect.href = false;
  }
}
