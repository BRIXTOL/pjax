import { Protocol } from './constants/regexp';
import { nanoid } from 'nanoid';
import * as store from './app/store';
import * as path from './app/path';
import * as hrefs from './observers/hrefs';
import * as request from './app/request';
import * as controller from './app/controller';
import * as render from './app/render';
import { IOptions } from './types/options';
import { IPage } from './types/page';
import { assign } from './constants/native';

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
export function connect (options: IOptions) {

  store.connect(options);

  if (supported) {
    if (Protocol.test(window.location.protocol)) {
      addEventListener('DOMContentLoaded', controller.initialize);
    } else {
      console.error('Invalid protocol, pjax expects https or http protocol');
    }
  } else {
    console.error('Pjax is not supported by this browser');
  }

};

/**
 * Reload
 *
 * Reloads the current page
 */
export async function reload () {

  const page = await request.get(store.pages.get(path.url));

  if (page) {
    console.info('Pjax: Triggered reload, page was re-cached');
    return render.update(page);
  }

  console.warn('Pjax: Reload Trigger failed!');

  return undefined;

};

/**
 * Cache
 */
export function cache (path?: string) {

  return path ? store.pages.get(path) : store.pages.all;

}
/**
 * UUID Generator
 */
export function uuid (size: number = 12) {

  return nanoid(size);

}

/**
 * Flush Cache
 */
export function clear (url?: string) {

  return store.clear(url);

}

/**
 * Visit
 */
export async function visit (
  link: string | Element,
  state: IPage = {}
): Promise<void|IPage> {

  const p = path.get(link, true);

  return store.has(p.url)
    ? state.hydrate
      ? hrefs.navigate(p.url, store.pages.update(p.url, state, p))
      : hrefs.navigate(p.url, store.pages.update(p.url, state))
    : hrefs.navigate(p.url, assign(state, p));

};

/**
 * Disconnect
 */
export function disconnect () {

  controller.destroy();

}
