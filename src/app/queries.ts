import type { Class, Page } from 'types';
import { $ } from './session';
import { emit } from './events';
import { log } from '../shared/logs';
import { empty, uuid, hasProp, forEach, hasProps, targets, ts, selector } from '../shared/utils';
import { o } from '../shared/native';
import { CharCode, Log, VisitType } from '../shared/enums';
import { parse, getTitle } from '../shared/dom';
import * as fragments from '../observe/fragment';
import { getLocation } from './location';

/**
 * Create Session Page
 *
 * Generates a page state record which will be written to our `pages` store and history state.
 * This is called for all new SPX visits to locations that do not exist in the session.
 *
 * This function will typically be triggered following a call to `getRoute`. The `getRoute()`
 * will have assigned the location information and in addition any attribute annotations passed
 * on the intercepted `<a href="*"></a>` element.
 *
 * The function will assign options in accordance to the SPX connection if they did not exist in
 * the `page` state value that was passed.
 */
export function create (page: Page): Page {

  const has = hasProps(page);

  page.ts = ts();
  page.target = targets(page);
  page.selector = selector(page.target);

  // assign the selector reference if it is undefined

  if ($.config.cache) {
    has('cache') || (page.cache = $.config.cache);
    page.snap ||= uuid();
  }

  if ($.config.hover !== false && page.type === VisitType.HOVER) {
    page.threshold ||= $.config.hover.threshold;
  }

  if ($.config.proximity !== false && page.type === VisitType.PROXIMITY) {
    page.proximity ||= $.config.proximity.distance;
    page.threshold ||= $.config.proximity.threshold;
  }

  if ($.config.progress) {
    page.progress ||= $.config.progress.threshold;
  }

  if (!has('history')) page.history = true;

  page.scrollY ||= 0;
  page.scrollX ||= 0;
  page.fragments ||= $.config.fragments;
  page.visits ||= 0;
  page.components ||= [];
  page.location ||= getLocation(page.key);

  $.pages[page.key] = page;

  return $.pages[page.key];

}

/**
 * New Page Session
 *
 * Clones a page but applies a reset on the provided keys, changing them to
 * the connection defaults.
 */
export function newPage (page: Page) {

  const state = o<Page>({
    ...page,
    target: [],
    selector: null,
    cache: $.config.cache,
    history: true,
    scrollX: 0,
    scrollY: 0,
    fragments: $.config.fragments
  });

  if ($.config.hover) {
    state.threshold = $.config.hover.threshold;
  }

  if ($.config.proximity) {
    state.proximity = $.config.proximity.distance;
    state.threshold = $.config.proximity.threshold;
  }

  if ($.config.progress) {
    state.progress = $.config.progress.threshold;
  }

  return state;

}

/**
 * Patch Session Page
 *
 * Updates a page record, applies an augmentation to the **current** page by default
 * looking up the key with the `history.state` reference.
 */
export function patch <T extends keyof Page> (prop: T, value: Page[T], key = $.history.key) {

  if (prop === 'location') {
    $.pages[key][prop] = Object.assign($.pages[prop][key], value);
  } else if (prop === 'target') {
    $.pages[key].target = targets(value);
    $.pages[key].selector = selector($.pages[key].target);
  } else {
    $.pages[key][prop] = value;
  }

}

/**
 * Set Session Page and Snapshot
 *
 * Writes the page to memory. New visits are defined by an event dispatched from a `href` link.
 * Both a new page visit or subsequent visit will pass through this function. This will be called
 * after an XHR fetch completes or when state is to be added to the session memory.
 */
export function set (page: Page, snapshot: string): Page {

  const event = emit('before:cache', page, snapshot as any);
  const dom = typeof event === 'string' ? event : snapshot;

  // VisitTypes above 5 are prefetch/trigger kinds.
  // We need to augment the page store to align with the record we are handling.
  if (page.type > VisitType.POPSTATE) {

    // VisitTypes above 9 are prefetch kinds
    // we need to update the type reference
    if (page.type > VisitType.RELOAD) {
      page.type = VisitType.PREFETCH;
    }
  }

  // Update to document title
  page.title = getTitle(snapshot);

  // If cache is disabled or the lifecycle event returned false we stop processing
  if (!$.config.cache || event === false) return page;

  // visit type must not be initial and snap id does not exist
  if (page.type !== VisitType.INITIAL && !hasProp(page, 'snap')) return update(page, dom);

  // Lets assign this record to the session store
  $.pages[page.key] = page;
  $.snaps[page.snap] = dom;

  fragments.setFragmentElements(page);

  emit('after:cache', page);

  return page;

}

/**
 * Update Session Page/Snapshot
 *
 * Update the page state and (optionally) its snapshot. The passed in state value expects
 * **route** values, so the `page` parameter must contain the following references:
 *
 * - `key`
 * - `rev`
 * - `type`
 * - `location`
 *
 * Typicaly, this function is used to augment the in-memory store and as such an already
 * generated record should be provided. At the absolute very least, we need to pass a generated `route`
 * that was created via `getRoute()` location function.
 */
export function update (page: Page, snapshot: string = null): Page {

  const state = hasProp($.pages, page.key) ? $.pages[page.key] : create(page);

  if (snapshot) {
    $.snaps[state.snap] = snapshot;
    page.title = getTitle(snapshot);
  }

  return Object.assign(state, page);

}

/**
 * Set Snapshot
 *
 * Replaces an exisiting snapshot DOM String with the provided `snapshot`
 * value. This function is used to align marked snapshots, wherein elements
 * are updated with identifier references such as `t.a1b2c4` (targets) or `f.a1b2c3`
 * (fragments) etc etc. Call to this function are typically occurring outside the
 * event loop.
 */
export function setSnap (snapshot: string, key?: string) {

  const snap = key = key
    ? key.charCodeAt(0) === CharCode.FWD
      ? key in $.pages ? $.pages[key].snap : null
      : key
    : $.page.snap;

  if (snap) {
    $.snaps[snap] = snapshot;
  } else {
    log(Log.WARN, 'Snapshot record does not exist, update failed');
  }

}

/**
 * Get Session
 *
 * Returns the in-memory (session) page store and a parsed document snapshot.
 * Optionally accepts a url `key` reference to retrieve a specific page. If `key` is
 * `undefined` (i.e, not provided), the current page is returned according to the
 * `history.state` reference. If no `key` exists an error is thrown.
 */
export function get (key?: string): { page: Page, dom: Document } {

  if (!key) {
    if ($.history === null) {
      log(Log.WARN, 'Missing history state reference, page cannot be returned');
      return;
    }

    key = $.history.key;

  }

  if (key in $.pages) {

    return {
      get page () { return $.pages[key]; },
      get dom () { return parse($.snaps[$.pages[key].snap]); }
    };

  }

  log(Log.ERROR, `No record exists: ${key}`);

}

/**
 * Get Snapshot DOM
 *
 * Returns a snapshot DOM. Optionally accepts a page `key` to return a specific
 * snapshot DOM record OR a `snap` UUID
 */
export function getSnapDom (key?: string): Document {

  const uuid = key
    ? key.charCodeAt(0) === CharCode.FWD
      ? $.pages[key].snap
      : key
    : $.page.snap;

  return parse($.snaps[uuid]);

}

/**
 * Get Mounted Components
 *
 * Returns an array list of component intances which are currently
 * mounted (active) on the page.
 */
export function mounted ({ mounted = null } = {}): { [instanceOf: string]: Class[] } {

  const mounts: { [instanceOf: string]: Class[] } = o();
  const { $instances, $connected } = $.components;

  for (const instance of $instances.values()) {

    if (!$connected.has(instance.scope.key)) continue;
    if (mounted !== null && instance.scope.status === mounted) continue;

    const has = hasProps(mounts);

    if (instance.scope.alias !== null && !has(instance.scope.alias)) {
      mounts[instance.scope.alias] = [ instance ];
    }

    has(instance.scope.instanceOf)
      ? mounts[instance.scope.instanceOf].push(instance)
      : mounts[instance.scope.instanceOf] = [ instance ];

  }

  return mounts;
}

/**
 * Get Session
 *
 * Returns the in-memory (session) page. Optionally accepts a url `key` reference to
 * retrieve a specific page. If `key` is `undefined` (i.e, not provided), the current
 * page is returned according to the `history.state` reference.
 */
export function getPage (key?: string): Page {

  if (!key) {

    if ($.history === null) {
      log(Log.WARN, 'Missing history state reference, page cannot be returned');
      return;
    }

    key = $.history.key;
  }

  if (hasProp($.pages, key)) return $.pages[key];

  log(Log.ERROR, `No page record exists for: ${key}`);

}

/**
 * Has Session
 *
 * Determines whether or not a `page` and `snapshot` exist for the passed in `key` reference.
 * This is used to inform SPX on what operations need to be carried out.
 */
export function has (key: string): boolean {

  return (
    hasProp($.pages, key) &&
    hasProp($.pages[key], 'snap') &&
    hasProp($.snaps, $.pages[key].snap) &&
    typeof $.snaps[$.pages[key].snap] === 'string'
  );

}

/**
 * Purge Session
 *
 * Clears all records from store excluding the passed `keys[]`.
 * or `key` Returns a list of snapshots that remain.
 */
export function purge (key: string | string[]) {

  const keys = Array.isArray(key) ? key : [ key ];

  for (const p in $.pages) {
    const index = keys.indexOf(p);
    if (index >= 0) {
      delete $.snaps[$.pages[p].snap];
      delete $.pages[p];
      keys.splice(index, 1);
    }
  }

}

/**
 * Clear Session
 *
 * Removes pages and snapshots from the in-memory session
 * store. Optionally accepts a single `key` value or a `string[]`
 * list of `key` values and when provided will remove those
 * records passed.
 */
export function clear (key?: string[] | string): void {

  if (!key) {

    empty($.pages);
    empty($.snaps);

  } else if (typeof key === 'string') {

    delete $.snaps[$.pages[key].snap];
    delete $.pages[key];

  } else if (Array.isArray(key)) {

    forEach(url => {
      delete $.snaps[$.pages[url].snap];
      delete $.pages[url];
    }, key);
  }
}
