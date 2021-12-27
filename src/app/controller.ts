import * as hrefs from '../observers/hrefs';
import * as hover from '../observers/hover';
import * as intersect from '../observers/intersect';
import * as request from '../app/request';
import * as scroll from '../observers/scroll';
import * as history from '../observers/history';
import browser from 'history/browser';
import { url, parse } from './path';
import { isArray } from '../constants/native';
import { connect } from './connects';
import * as store from './store';
import { forEach } from './utils';
import { ILocation } from '../types/location';

/**
 * Sets initial page state executing on intial load.
 * Caches page so a return navigation does not perform
 * an extrenous request.
 */
function onload (): void {

  const page = store.capture({
    url,
    location: parse(url),
    position: scroll.position
  }, document.documentElement.outerHTML);

  if (store.config.prefetch.preempt !== null) {
    const { preempt } = store.config.prefetch;
    if (isArray(preempt)) forEach(path => request.get(path, 'preempt'))(preempt);
    else if (preempt?.[url]) delete preempt[url];
  }

  if (store.config.cache.reverse) {
    const previous: { location?: ILocation } = browser.location.state;
    if (previous?.location?.lastpath) {
      request
        .get(previous.location.lastpath, 'reverse')
        .then(() => browser.replace(window.location, page));
    }
  } else {
    browser.replace(window.location, page);
  }

  removeEventListener('load', onload);

}

/**
 * Initialize
 */
export function initialize (): void {

  if (!connect.controller) {

    history.start();
    hrefs.start();
    scroll.start();
    hover.start();
    intersect.start();

    addEventListener('load', onload);

    connect.controller = true;

    console.info('Pjax: Connection Established ⚡');
  }
}

/**
 * Destory Pjax instances
 */
export function destroy (): void {

  if (connect.controller) {

    history.stop();
    hrefs.stop();
    scroll.stop();
    hover.stop();
    intersect.stop();
    store.clear();

    connect.controller = false;

    console.warn('Pjax: Instance has been disconnected! 😔');

  } else {

    console.warn('Pjax: No connection made, disconnection is void 🙃');
  }

}
