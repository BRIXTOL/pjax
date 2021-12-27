import merge from 'mergerino';
import browser from 'history/browser';
import { nanoid } from 'nanoid';
import { object } from './object';
import { IPage } from '../types/page';
import { IOptions } from '../types/options';
import { assign, isArray } from '../constants/native';
import { dispatchEvent } from './events';
import * as scroll from '../observers/scroll';
import * as progress from './progress';

/**
 * Page State
 */
export const pages = object<{ [url: string]: IPage }>({
  writable: true,
  configurable: true
});

/**
 * Snapshots
 */
export const snaps = object<{ [id: string]: string }>({
  writable: true,
  configurable: true
});

/**
 * Configuration
 */
export const config: IOptions & {
  session: {
    clicks: string;
    hovers: string;
  }
} = {
  targets: [ 'body' ],
  session: {
    clicks: 'a:not([data-pjax-disable]):not([href^="#"])',
    hovers: 'a:not([data-pjax-disable]):not([href^="#"])'
  },
  request: {
    timeout: 30000,
    poll: 150,
    async: true,
    dispatch: 'mousedown'
  },
  prefetch: {
    preempt: null,
    mouseover: {
      enable: true,
      threshold: 100,
      trigger: 'href',
      proximity: 0
    },
    intersect: {
      enable: true
    }
  },
  cache: {
    enable: true,
    limit: 25,
    save: false,
    reverse: true
  },
  progress: {
    enable: true,
    threshold: 850,
    style: {
      render: true,
      colour: '#111',
      height: '2px'
    },
    options: {
      minimum: 0.1,
      easing: 'ease',
      speed: 225,
      trickle: true,
      trickleSpeed: 225,
      showSpinner: false
    }
  }
};

/**
 * Connects store and intialized the workable
 * state management model. Connect MUST be called
 * upon Pjax initialization. This function acts
 * as a class `constructor` establishing an instance.
 */
export function connect (options: IOptions = {}): void {

  const updated = merge(config, {
    ...options, // PRESETS PATCH COPY
    request: { ...options?.request, dispatch: undefined },
    cache: { ...options?.cache, save: undefined },
    session: {
      hovers: config.prefetch.mouseover.trigger === 'attribute'
        ? 'a:not([data-pjax-disable]):not([href^="#"])'
        : 'a:not([data-pjax-disable]):not([href^="#"]):not([data-pjax-prefetch="false"])'
    }
  });

  assign(config, updated);

  // Assert Progress
  if (config.progress.enable) progress.config(config.progress);

}

/**
 * Handles a new page visit or a return page visit. New visits
 * are defined by an event dispatched from a `href` link. Both a new
 * new page visit or subsequent visit will call this function.
 *
 * **Breakdown**
 *
 * Subsequent visits calling this function will have their per-page
 * specific state (generally the configs set via attributes) reset
 * and merged into its existing records (if it has any), otherwise
 * a new page instance will be generated including defult preset configs.
 */
export function capture (state: IPage, snapshot: string): IPage {

  const page = assign({
    history: true,
    snapshot: state.snapshot || nanoid(16),
    position: state.position || scroll.reset(),
    cache: config.cache.enable,
    progress: config.progress.threshold,
    threshold: config.prefetch.mouseover.threshold
  }, state, {
    targets: config.targets
  });

  if (page.cache && dispatchEvent('pjax:cache', page, true)) {
    pages.set(page.url, page);
    snaps.set(page.snapshot, snapshot);
  }

  return page;

}

/**
 * Hydrate Capture
 *
 * This method run a hydration replacement. When targets are
 * defined on `hydrate[]` or `data-pjax-hydrate="([])"` then
 * the target location will replace the defined fragments on the
 * the page cache reference the fetch was trigger from.
 */
export function hydrate (state: IPage, snapshot: string): IPage {

  const page = pages.update(state.location.lastpath, { hydrate: state.hydrate });
  snaps.set(page.snapshot, snapshot);

  return page;

}

/**
 * Removes cached records. Optionally pass in URL
 * to remove specific record.
 */
export function clear (url?: string[] | string): void {

  if (typeof url === 'undefined') {

    pages.clear();
    snaps.clear();

  } else if (typeof url === 'string') {

    snaps.delete(pages.get(url).snapshot);
    pages.delete(url);

  } else if (isArray(url)) {

    const saved = pages.clear(url);
    snaps.clear(saved as any);

  }

}

/**
 * Check if cache record exists with snapshot
 *
 * @param {string} url
 * @param {{snapshot?: boolean}} has
 */
export function get (url: string) {

  const page = pages.get(url);

  return {
    page,
    snapshot: snaps.get(page.snapshot)
  };
}

/**
 * Check if cache record exists with snapshot
 */
export function has (url: string): boolean {

  return pages.has(url, 'snapshot') ? snaps.has(pages.get(url).snapshot) : false;

}

/**
 * Update current pushState History
 */
export function history (): string {

  const { location } = browser;
  const updated = assign({}, location.state, { position: scroll.position });

  browser.replace(location, updated);

  return (location.state as any).url;
}
