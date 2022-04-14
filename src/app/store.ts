import { nanoid } from 'nanoid';
import { IPage } from '../types/page';
import { emit } from './events';
import { emptyObject } from './utils';
import { assign, create as object, isArray } from '../constants/native';
import { pages, snaps, config } from './state';
import { ILocation } from 'types';
import * as scroll from '../observers/scroll';
import { StoreType } from '../constants/enums';

/**
 * Clear
 *
 * Removes cached records. Optionally pass in URL
 * to remove specific record.
 */
export function clear (url?: string[] | string): void {

  if (typeof url === 'undefined') {

    emptyObject(pages);
    emptyObject(snaps);

  } else if (typeof url === 'string') {

    delete snaps[pages[url].snapshot];
    delete pages[url];

  } else if (isArray(url)) {

    purge(url);

  }

}

/**
 * Defaults
 *
 * Page state defaults applied to `pages` and written
 * to history push state. This is used on each pjax
 * visit and will be overwritten by attribute configs
 * or by any programmatic triggers.
 */
export function create (state?: IPage): IPage {

  const page: IPage = object(null);

  page.key = null;
  page.history = true;
  page.type = StoreType.VISIT;
  page.title = document.title;
  page.replace = config.targets;
  page.cache = config.cache;
  page.snapshot = page.cache ? nanoid() : null;
  page.position = scroll.y0x0();
  page.location = object(null) as ILocation;

  if (config.proximity !== false) page.proximity = config.proximity.threshold;
  if (config.hover !== false) page.threshold = config.hover.threshold;
  if (config.progress !== false) page.progress = config.progress.threshold;

  if (!page.cache) delete state.cache;

  return assign(page, state);

}

/**
 * Check if cache record exists with snapshot
 */
export function cache (record?: 'page' | 'snapshot' | 'location') {

  const page = pages[cache.prototype.key];

  if (record === 'page') return page as IPage;
  if (record === 'location') return page.location as ILocation;
  if (record === 'snapshot') return snaps[page.snapshot] as string;

  return {
    page,
    get snapshot () { return snaps[page.snapshot]; }
  };

};

/**
 * Handles a new page visit or a return page visit. New visits
 * are defined by an event dispatched from a `href` link. Both a new
 * new page visit or subsequent visit will call this function.
 *
 * **Breakdown**
 *
 * Subsequent visits calling this function will have their per-page
 * specific state like the config set via attributes reset and merged
 * into its existing records (if it has any), otherwise a new page
 * instance will be generated with the default preset configuration.
 */
export function set (state: IPage, snapshot: string): IPage {

  const event = emit('cache', state, snapshot);

  if (event === false) return;

  pages[state.key] = state;
  cache.prototype.key = state.key;

  if (state.cache) {
    snaps[state.snapshot] = typeof event === 'string'
      ? event
      : snapshot;
  }

  return state;

}

/**
 * Update the page state and snapshots
 */
export function update (state: IPage, snapshot?: string): IPage {

  const page = state.key in pages
    ? assign(pages[state.key], state)
    : create(state);

  if (typeof snapshot === 'string') {
    snaps[page.snapshot] = snapshot;
  }
  return page;

}

/**
 * Check if cache record exists with snapshot
 *
 * @param {string} url
 */
export function get (url: string) {

  const page = pages[url];
  const snapshot = snaps[page.snapshot];

  return ({ page, snapshot });

}

/**
 * Check if cache record exists with snapshot
 */
export function has (url: string): boolean {

  return (url in pages && 'snapshot' in pages[url])
    ? pages[url].snapshot in snaps
    : false;

}

/**
 * Purge
 *
 * Clears all records from store. Optionally provide a list
 * of targets to be cleared. Returns a list of snapshots
 * that remain.
 */
export function purge (targets: string[] = []) {

  return Object.getOwnPropertyNames(pages).forEach((url) => {
    if (!targets.includes(url)) delete pages[url];
    else delete snaps[pages[url].snapshot];
  });

}
