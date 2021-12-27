import { supportsPointerEvents } from 'detect-it';
import { getLink, getTargets, attrparse } from '../app/utils';
import { object } from '../app/object';
import { dispatchEvent } from '../app/events';
import { y0x0 } from './scroll';
import * as store from '../app/store';
import * as request from '../app/request';
import * as path from '../app/path';
import { IPage } from '../types/page';
import { connect } from '../app/connects';

const transit = object<{
  [url: string]: NodeJS.Timeout
}>({
  writable: true,
  configurable: true
});

/**
 * Cleanup throttlers
 */
function cleanup (url: string): boolean {

  clearTimeout(transit.get(url));

  return transit.delete(url);

};

/**
 * Cancels prefetch, if mouse leaves target before threshold
 * concludes. This prevents fetches being made for hovers that
 * do not exceeds threshold.
 */
function onMouseleave (event: MouseEvent) {

  const target = getLink(event.target, store.config.session.hovers);

  if (target) {
    cleanup(path.get(target).url);
    handleLeave(target);
  }

};

/**
 * Fetch Throttle
 */
function throttle (url: string, fn: ()=> void, delay: number): void {

  if (!store.has(url) && !transit.has(url)) {
    transit.set(url, setTimeout(fn, delay));
  }
};

/**
 * Fetch document and add the response to session cache.
 * Lifecycle event `pjax:cache` will fire upon completion.
 */
async function prefetch (state: IPage): Promise<boolean> {

  if (!(await request.get(state))) {
    console.warn(`Pjax: Prefetch will retry on next mouseover for: ${state.url}`);
  }

  return cleanup(state.url);

};

/**
 * Attempts to visit location, Handles bubbled mouseovers and
 * Dispatches to the fetcher. Once item is cached, the mouseover
 * event is removed.
 *
 * @param {MouseEvent} event
 */
function onMouseover (event: MouseEvent): void {

  const target = getLink(event.target, store.config.session.hovers);

  if (!target) return undefined;

  const { url, location } = path.get(target);

  if (!dispatchEvent('pjax:prefetch', { target, url, location }, true)) {
    return disconnect(target);
  }

  if (store.has(url)) return disconnect(target);

  handleLeave(target);

  const state = attrparse(target, {
    url,
    location,
    position: y0x0()
  });

  throttle(url, async () => {
    if (await prefetch(state)) handleLeave(target);
  }, state.threshold || store.config.prefetch.mouseover.threshold);

};

/**
 * Attach mouseover events to all defined element targets
 */
function handleHover (target: EventTarget): void {

  if (supportsPointerEvents) {
    target.addEventListener('pointerover', onMouseover, false);
  } else {
    target.addEventListener('mouseover', onMouseover, false);
  }

};

/**
 * Cancels prefetch, if mouse leaves target before threshold
 * concludes. This prevents fetches being made for hovers that
 * do not exceeds threshold.
 */
function handleLeave (target: Element): void {

  if (supportsPointerEvents) {
    target.removeEventListener('pointerout', onMouseleave, false);
  } else {
    target.removeEventListener('mouseleave', onMouseleave, false);
  }
}

/**
 * Adds and/or Removes click events.
 */
function disconnect (target: EventTarget): void {

  if (supportsPointerEvents) {
    target.removeEventListener('pointerover', onMouseleave, false);
    target.removeEventListener('pointerout', onMouseleave, false);
  } else {
    target.removeEventListener('mouseleave', onMouseleave, false);
    target.removeEventListener('mouseover', onMouseover, false);
  }

}

/**
 * Starts mouseovers, will attach mouseover events
 * to all elements which contain a `data-pjax-prefetch="hover"`
 * data attribute
 */
export function start (): void {

  if (connect.hover) return;

  getTargets(store.config.session.hovers).forEach(handleHover);

  connect.hover = true;

}

/**
 * Stops mouseovers, will remove all mouseover and mouseout
 * events on elements which contains a `data-pjax-prefetch="hover"`
 * unless target href already exists in cache.
 */
export function stop (): void {

  if (!connect.hover) return;

  if (transit.clear()) {
    getTargets(store.config.session.hovers).forEach(disconnect);
    connect.hover = false;
  }

};
