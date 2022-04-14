import { IPage } from 'types';
import { BrowserHistory, createPath } from 'history';
import * as render from '../app/render';
import * as request from '../app/request';
import * as store from '../app/store';
import * as scroll from './scroll';
import { connect, pages } from '../app/state';
import { assign, history } from '../constants/native';
import { EventType, StoreType } from '../constants/enums';

/**
 * Listener state
 */
let unlisten: () => void = null;

/**
 * Determines if page is in transit
 */
let inTransit: string;

/**
 * Create history state
 *
 * Triggers a history replace action saving
 * the current page state to history.
 */
export function create (state: IPage) {

  history.replace(history.location, state);

  return history.location.state;

}

/**
 * Create history state
 */
export function get () {

  return history.location.state;

}

/**
 * Check if history state holds lastpath
 */
export function previous () {

  // PERFORM REVERSE CACHING
  if (history.location.state === null) return false;

  const state = history.location.state as IPage;

  if ('location' in state) {
    if ('lastpath' in state.location) {
      return state.location.lastpath;
    }
  }

  return false;

}

/**
 * Execute a history state replacement for the current
 * page location. It's intended use is to update the
 * current scroll position and any other values stored
 * in history state.
 */
export function update (): IPage {

  const update = assign(history.location.state as IPage, { position: scroll.position() });

  history.replace(history.location, update);

  return update;

}

/**
 * Popstate Event
 *
 * Fires popstate navigation request
 */
async function popstate (url: string, state: IPage): Promise<void|IPage> {

  if (url !== inTransit) request.abort(inTransit);

  if (store.has(url)) {
    if (state.type !== null && state.type === StoreType.REVERSE) pages[url].position = state.position;
    return render.update(pages[url], true);
  }

  inTransit = url;

  const page = await request.get(state, EventType.POPSTATE);

  return page ? render.update(page, true) : location.assign(url);

};

/**
 * Listener Callback
 *
 * Event History dispatch controller, handles popstate,
 * push and replace events via third party module
 */
function listener ({ action, location }: BrowserHistory) {

  if (action === 'POP') return popstate(createPath(location), location.state);

};

/**
 * Start History API
 *
 * Attached `history` event listener.
 */
export function start (): void {

  if (!connect.has(2)) {
    unlisten = history.listen(listener);
    connect.add(2);
  }

}

/**
 * End History API
 *
 * Removed `history` event listener.
 */
export function stop (): void {

  if (connect.has(2)) {
    unlisten();
    connect.delete(2);
  }

}
