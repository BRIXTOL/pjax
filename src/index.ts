import { IConfig } from 'types';
import { initialize } from './app/config';
import { getRoute, origin } from './app/route';
import { IPage } from './types/page';
import { assign, create } from './constants/native';
import * as store from './app/store';
import * as hrefs from './observers/hrefs';
import * as request from './app/request';
import * as controller from './app/controller';
import * as render from './app/render';
import * as scroll from './observers/scroll';
import * as state from './app/state';

/**
 * Event Emitters
 */
export { on, off } from './app/events';

/**
 * Supported
 */
export const supported = !!(
  window.history.pushState &&
  window.requestAnimationFrame &&
  window.addEventListener &&
  window.DOMParser
);

/**
 * Connect Pjax
 */
export function connect (options: IConfig = {}) {

  initialize(options);

  if (supported) {
    if (/https?/.test(window.location.protocol)) {
      addEventListener('DOMContentLoaded', controller.initialize);
    } else {
      console.error('Pjax: Invalid protocol, pjax expects https or http protocol');
    }
  } else {
    console.error('Pjax is not supported by this browser');
  }

};

/**
 * Session
 *
 * Returns the current pjax session
 */
export function session () {

  return state;

}

/**
 * Reload
 *
 * Reloads the current page
 */
export async function reload () {

  const state = store.cache('page') as IPage;
  const page = await request.get(state);

  if (page) {
    console.info('Pjax: Triggered reload, page was re-cached');
    return render.update(page);
  }

  console.warn('Pjax: Reload failed, triggering refresh (cache will be purged)');

  return location.assign(state.key);

};

/**
 * Cache
 */
export function cache (key?: string) {

  const o = create(null);

  if (key) {
    if (key in state.pages) return store.get(key);
    else console.error(`Pjax: No store exists for ${key}`);
  }

  o.state = state.pages;
  o.snaps = state.snaps;
  o.size = request.cacheSize();

  return o;
}

/**
 * Flush Cache
 */
export async function fetch (url: string, { parsed = false } = { parsed: false }) {

  const link = getRoute(url);

  if (link.location.origin !== origin) {
    return console.error('Pjax: Cross origin fetches are not allowed');
  }

  const response = await request.httpRequest(link.key);

  if (response) return parsed ? render.parse(response) : response;

}

/**
 * Flush Cache
 */
export function clear (url?: string) {

  return store.clear(url);

}

/**
 * Hydrate the current document
 */
export async function hydrate (link: string, elements: string[]): Promise<void|IPage> {

  const route = getRoute();
  const last = store.get(route.key);

  route.hydrate = elements;
  route.position = scroll.position();
  route.type = 'hydrate';

  const dom = await request.httpRequest(link);

  if (!dom) return console.warn('Pjax: hydration failed');

  const update = render.update(store.update(route, dom));

  if (state.config.reverse) {
    const route = getRoute(last.page.location.lastpath, 'preload');
    request.get(route);
  }

  return update;

};

/**
 * Visit
 */
export async function prefetch (link: string | Element): Promise<void|IPage> {

  const path = getRoute(link);

  if (store.has(path.key)) {
    console.warn(`Pjax: Cache already exists for ${path.key}, prefetch skipped`);
    return;
  }

  const prefetch = await request.get(store.create(path));

  if (!prefetch) {
    console.warn(`Pjax: Prefetch failed for ${path.key}`);
  }

};

/**
 * Visit
 */
export async function visit (link: string | Element, options?: IPage): Promise<void|IPage> {

  const route = getRoute(link);
  const merge = typeof options === 'object' ? assign(route, options) : route;

  return store.has(route.key)
    ? hrefs.navigate(route.key, store.update(merge))
    : hrefs.navigate(route.key, store.create(merge));

};

/**
 * Disconnect
 */
export function disconnect () {

  controller.destroy();

}
