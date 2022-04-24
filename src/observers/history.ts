import { HistoryState, IPage } from 'types';
import { pages, observers, config, snapshots } from '../app/session';
import { history, object } from '../shared/native';
import { hasProp } from '../shared/utils';
import * as render from '../app/render';
import * as request from '../app/fetch';
import * as store from '../app/store';
import * as scroll from './scroll';
import { EventType } from '../shared/enums';
import { getKey, getRoute } from '../app/route';

/**
 * History API - Re-export of the `window.history` native constant
 */
export { history as api } from '../shared/native';

/**
 * The state reference to be populated and saved in the browser state.
 * This is a partial copy of the in-memory page state. The function
 * will omit render specific options that could otherwise be applied
 * via attribute annotation.
 */
function stack (page: IPage) {

  const state: HistoryState = object(null);

  state.key = page.key;
  state.rev = page.rev;
  state.title = page.title;
  state.uuid = page.uuid;
  state.cache = page.cache;
  state.replace = page.replace;
  state.type = page.type;
  state.progress = page.progress;
  state.position = scroll.reset();

  return state;
}

function load () {

  return document.readyState === 'complete';
}

/**
 * Returns History State
 */
export function get () {

  return history.state;

}

/**
 * Check if history state holds reverse
 * last path reference. Returns a boolean
 *
 */
export function reverse () {

  return (
    history.state !== null &&
    hasProp(history.state, 'rev') &&
    history.state.key !== history.state.rev
  );

}

export function replace (state: IPage) {

  // console.log('REPLACE', state);

  history.replaceState(stack(state), state.title, state.key);

  return state;

}

export function push (state: IPage) {

  // console.log('PUSH STATE', state);

  history.pushState(stack(state), state.title, state.key);

  return state;

}

let timeout: NodeJS.Timeout;

/**
 * Popstate Event
 *
 * Fires popstate navigation request
 */
function pop (event: PopStateEvent & { state: HistoryState }, retry?: string) {

  if (!load()) return;

  const { state } = event;

  clearInterval(timeout);

  if (store.has(state.key)) {
    request.reverse(state.rev);
    return render.update(pages[state.key]);
  }

  timeout = setTimeout(async function () {

    state.type = EventType.POPSTATE;

    const page = await request.fetch(state);
    if (!page) return location.assign(state.key);

    const key = getKey(location);

    // console.log(state.key, page.key, key);

    if (page.key === key) return render.update(page);
    if (store.has(key)) return render.update(pages[key]);

    const data = store.create(getRoute(key, EventType.POPSTATE));

    request.fetch(data);
    history.replaceState(data, document.title, key);

  }, 300);

};

/**
 * Listener Callback
 *
 * Event History dispatch controller, handles popstate,
 * push and replace events via third party module
 */

// eslint-disable-next-line no-unused-vars
function persist ({ timeStamp }: BeforeUnloadEvent) {

  // console.log('PERSIST', timeStamp);
  window.sessionStorage.setItem(config.session, JSON.stringify({ snapshots, pages }));

};

/**
 * Start History API
 *
 * Attached `history` event listener.
 */
export function connect (): void {

  if (observers.history) return;

  addEventListener('popstate', pop, false);
  addEventListener('load', load, false);
  // addEventListener('beforeunload', persist, { capture: true });

  observers.history = true;

}

/**
 * End History API
 *
 * Removed `history` event listener.
 */
export function disconnect (): void {

  if (!observers.history) return;

  removeEventListener('popstate', pop, false);
  addEventListener('load', load, false);
  // removeEventListener('beforeunload', persist, { capture: true });

  observers.history = false;

}
