import { IPage, ICacheSize } from '../types/page';
import { emit } from './events';
import { byteConvert, byteSize } from './utils';
import * as progress from './progress';
import { config, transit, timers } from './state';
import * as store from './store';
import { create } from '../constants/native';
import { EventType } from 'types';

let storage: number = 0;

/**
 * Async Timeout
 */
function pending (callback: Function): Promise<boolean> {

  return new Promise(resolve => setTimeout(() => resolve(callback()), 5));

};

/**
 * Executes on request end. Removes the XHR recrod and update
 * the response DOMString cache size record.
 */
async function httpRequestEnd (url: string, DOMString: string) {

  storage = storage + byteSize(DOMString);

};

/**
 * Fetch XHR Request wrapper function
 */
export function httpRequest (url: string): Promise<string | false> {

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {

    // OPEN
    //
    xhr.open('GET', url, config.async);

    // HEADERS
    //
    xhr.setRequestHeader('X-Brixtol-Pjax', 'true');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    // EVENTS
    //
    xhr.onloadstart = e => {
      transit[url] = xhr;
    };
    xhr.onload = e => {
      resolve(xhr.status === 200 ? xhr.responseText : false);
    };
    xhr.onabort = e => {
      delete transit[url];
    };
    xhr.onloadend = e => {
      delete transit[url];
      httpRequestEnd(url, xhr.responseText);
    };

    xhr.onerror = reject;
    xhr.timeout = config.timeout;
    xhr.responseType = 'text';

    // SEND
    //
    xhr.send(null);

  });

};

/**
 * Fetch Throttle
 */
export function throttle (url: string, fn: () => void, delay: number): void {

  if (url in timers) return;
  if (!store.has(url)) timers[url] = setTimeout(fn, delay);

};

/**
 * Cleanup throttlers
 */
export function cleanup (url: string) {

  if (url in timers) {
    clearTimeout(timers[url]);
    return delete timers[url];
  }

  return true;
}

/**
 * Returns request cache metrics
 */
export function cacheSize (): ICacheSize {

  const cache = create(null);

  cache.total = storage;
  cache.weight = byteConvert(storage);

  return cache;
}

/**
 * Abort Request
 *
 * Aborts a specific request in transit.
 */
export function abort (url: string): void {

  if (url in transit) {
    transit[url].abort();
    console.warn(`Pjax: XHR Request was cancelled for url: ${url}`);
  }

};

/**
 * Cancel Requests
 *
 * Aborts all pending requests excluding the
 * the request id (page key identifier) provided.
 * To cancel a specific request, use `abort` export.
 */
export function cancel (id: string): void {

  for (const url in transit) {
    if (id !== url) {
      transit[url].abort();
      console.warn(`Pjax: Cancelled pending request: ${url}`);
    }
  }
};

/**
 * Prevents repeated transit from being executed.
 * When prefetching, if a request is in transit and a click
 * event dispatched this will prevent multiple transit and
 * instead wait for initial fetch to complete.
 *
 * Number of recursive runs to make, set this to 85 to disable,
 * else just leave it to execute as is.
 *
 * Returns `true` if request resolved in `850ms` else `false`
 */
export async function inFlight (url: string, rate = 0): Promise<boolean> {

  if ((url in transit) && rate <= config.timeout) {
    if ((rate * 5) === config.progress.threshold) progress.start();
    rate++;
    return pending(() => inFlight(url, rate));
  }

  return delete transit[url];

};

/**
 * Fetches documents and guards from duplicated transit
 * from being dispatched if an indentical fetch is in flight.
 * transit will always save responses and snapshots.
 */
export async function get (state: IPage, type: EventType): Promise<IPage|false> {

  if (state.key in transit) {
    console.warn(`Pjax: XHR Request is already in transit for: ${state.key}`);
    return;
  }

  if (!emit('request', state, type)) {
    console.info(`Pjax: Request cancelled via dispatched event for: ${state.key}`);
    return false;
  }

  try {

    const snapshot = await httpRequest(state.key);

    // CREATE CACHE RECORD
    if (snapshot) return store.set(state, snapshot);

    console.warn(`Pjax: Failed to retrive response at: ${state.key}`);

  } catch (e) {

    delete transit[state.key];
    console.error('Pjax: Fetch error:', e);

  }

  return false;

};
