import * as hrefs from '../observers/hrefs';
import * as hover from '../observers/hover';
import * as intersect from '../observers/intersect';
import * as request from '../app/request';
import * as scroll from '../observers/scroll';
import * as history from '../observers/history';
import * as proximity from '../observers/proximity';
import { EventType, StoreType } from '../constants/enums';
import { getRoute } from './route';
import { connect, config } from './state';
import { emit } from './events';
import * as store from './store';
import { isArray } from '../constants/native';

/**
 * Sets initial page state executing on intial load.
 * Caches page so a return navigation does not perform
 * an extrenous request.
 */
function onload (): void {

  // PERFORM REVERSE CACHING
  const state = store.create(getRoute());
  const reverse = history.previous();

  if (config.reverse && typeof reverse === 'string') state.location.lastpath = reverse;

  const page = store.set(state, document.documentElement.outerHTML);
  state.position = scroll.position();

  emit('connected', page);

  if (config.preload !== null) {
    if (isArray(config.preload)) {

      // PRELOAD ARRAY LIST
      for (const path of config.preload) {
        const route = getRoute(path, StoreType.PRELOAD);
        if (route.key !== path) request.get(store.create(route), EventType.PRELOAD);
      }

    } else if (typeof config.preload === 'object' && state.key in config.preload) {

      // PRELOAD SPECIFIC ROUTE LIST
      for (const path of config.preload[state.key]) {
        const route = getRoute(path, StoreType.PRELOAD);
        if (route.key !== path) request.get(store.create(route), EventType.PRELOAD);
      }
    }
  }

  history.create(page);

  if (page.location.lastpath !== state.key) {
    const state = getRoute(page.location.lastpath, StoreType.REVERSE);
    request.get(store.create(state), EventType.REVERSE);
  }

  removeEventListener('load', onload);

}

/**
 * Initialize
 */
export function initialize (): void {

  if (!connect.has(1)) {

    history.start();
    scroll.start();
    hrefs.start();
    hover.start();
    intersect.start();
    proximity.start();

    addEventListener('load', onload);

    connect.add(1);
    console.info('Brixtol Pjax: Connection Established ⚡');
  }
}

/**
 * Destory Pjax instances
 */
export function destroy (): void {

  if (connect.has(1)) {

    history.stop();
    scroll.stop();
    hrefs.stop();
    hover.stop();
    intersect.stop();
    proximity.stop();
    store.clear();
    connect.delete(1);

    console.warn('Brixtol Pjax: Instance has been disconnected! 😔');

  } else {

    console.warn('Brixtol Pjax: No connection made, disconnection is void 🙃');
  }

}
