import { IPage } from '../types/page';
import { emit } from './events';
import { empty, uuid, hasProp, log, forEach } from '../shared/utils';
import { assign, object, isArray, history } from '../shared/native';
import { pages, snapshots, config } from './session';
// import { getRoute } from './route';
import { Errors, EventType } from '../shared/enums';
import { parse, getTitle } from '../shared/dom';

/**
 * Clears all records from store excluding the passed `keys[]`.
 * or `key` Returns a list of snapshots that remain.
 */
export function purge (key: string | string[] = []) {

  const keys = isArray(key) ? key : [ key ];

  for (const p in pages) {
    const index = keys.indexOf(p);
    if (index >= 0) {
      delete snapshots[pages[p].uuid];
      delete pages[p];
      keys.splice(index, 1);
    }
  }

}

/**
 * Removes pages and snapshots from the in-memory session
 * store. Optionally accepts a single `key` value or a `string[]`
 * list of `key` values and when provided will remove those
 * records passed.
 */
export function clear (key?: string[] | string): void {

  if (!key) {

    empty(pages);
    empty(snapshots);

  } else if (typeof key === 'string') {

    delete snapshots[pages[key].uuid];
    delete pages[key];

  } else if (isArray(key)) {

    forEach(url => {

      delete pages[url];
      delete snapshots[pages[url].uuid];

    }, key);
  }
}

/**
 * Generates a page state record which will be written
 * to our `pages` store and history state. This is called
 * for all new SPX visits to locations that do not exist
 * in the session and will typically be executed following
 * a call to `getRoute` which will have assigned the route
 * preset values and any annotations (attributes).
 *
 * We assign defaults defined in the SPX connection that
 * did not exist in the `page` state value that provided.
 */
export function create (page: IPage): IPage {

  page.replace = hasProp(page, 'replace')
    ? [].concat(config.targets, page.replace)
    : config.targets;

  if (config.cache) {
    if (!hasProp(page, 'cache')) page.cache = config.cache;
    if (!hasProp(page, 'uuid')) page.uuid = uuid();
  }

  if (!hasProp(page, 'position')) {
    page.position = object(null);
    page.position.y = 0;
    page.position.x = 0;
  }

  if (config.hover !== false && page.type === EventType.HOVER) {
    if (!hasProp(page, 'threshold')) page.threshold = config.hover.threshold;
  }

  if (config.proximity !== false && page.type === EventType.PROXIMITY) {
    if (!hasProp(page, 'proximity')) page.proximity = config.proximity.distance;
    if (!hasProp(page, 'threshold')) page.threshold = config.proximity.threshold;
  }

  if (config.progress !== false && !hasProp(page, 'progress')) {
    page.progress = config.progress.threshold;
  }

  if (!hasProp(page, 'visits')) page.visits = 0;

  const state = pages[page.key] = page;

  return state;

}

/**
 * Writes the page to memory. New visits are defined by an event
 * dispatched from a `href` link. Both a new new page visit or
 * subsequent visit will pass through this function. This will
 * be called after an XHR fetch completes or when state is to be
 * added to the session memory.
 */
export function set (state: IPage, snapshot: string): IPage {

  console.log(state);

  const event = emit('store', state, snapshot);
  const dom = typeof event === 'string' ? event : snapshot;

  // EventTypes 4, 5 and 6 are prefetch types then we
  // update the type record to infer prefetch in the
  // next lifecycle events to emitted
  if (state.type > 3 && state.type < 7) state.type = EventType.PREFETCH;

  // Update to document title reference
  state.title = getTitle(dom);

  // If cache is disabled or the lifecycle event
  // returned a boolean false values we will return the record
  if (!config.cache || event === false) return state;

  pages[state.key] = state;
  snapshots[state.uuid] = dom;

  emit('cached', state);

  return state;

}

/**
 * Update the page state and (optionally) its snapshot.
 * The passed in state value expects route values, ie:
 * the `page` must contain the following:
 *
 * - `key`
 * - `rev`
 * - `type`
 * - `location`
 *
 * Typicaly, this function augments the in-memory store
 * and as such an already generated record should be
 * provided or at the very least pass a generated `route`
 * using `getRoute()` to ensure the expected values.
 */
export function update (page: IPage, snapshot?: string): IPage {

  const state = hasProp(pages, page.key) ? pages[page.key] : create(page);

  if (typeof snapshot === 'string') {
    snapshots[page.uuid] = snapshot;
    page.title = getTitle(snapshot);
  }

  return assign(state, page);

}

/**
 * Returns the in-memory (session) page store and a
 * parsed document snapshot. Optionally accepts a url
 * `key` reference to retrieve a specific page. If `key`
 * is undefined (not passed) then the current page is
 * returned according to the history API state record.
 */
export function get (key = history.state.key): { page: IPage, dom: Document } {

  if (hasProp(pages, key)) {

    const state = object(null);
    state.page = pages[key];
    state.dom = parse(snapshots[state.page.uuid]);

    return state;

  }

  log(Errors.ERROR, `No record exists: ${key}`);
}

/**
 * Determines whether or not a `page` and `snapshot` exist for
 * the passed in `key` reference. This is used to inform SPX
 * on what operations need to be carried out.
 */
export function has (key: string): boolean {

  return (
    hasProp(pages, key) &&
    hasProp(pages[key], 'uuid') &&
    hasProp(snapshots, pages[key].uuid)
  );

}
