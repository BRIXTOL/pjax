import { IConfig, IPage, ISelectors } from 'types';
import { create } from '../constants/native';

/**
 * Configuration
 *
 * Initialization settings applied upon Pjax connection.
 * These are instance options, informing upon how the
 * pjax instance should run. The options defined here are
 * the defaults applied at runtime.
 */
export const config: IConfig = {
  targets: [ 'body' ],
  timeout: 30000,
  poll: 15,
  schema: 'pjax',
  async: true,
  cache: true,
  reverse: true,
  limit: 50,
  preload: null,
  hover: {
    trigger: 'attribute',
    threshold: 250
  },
  intersect: {
    rootMargin: '0px 0px 0px 0px',
    threshold: 0
  },
  proximity: {
    distance: 75,
    threshold: 250,
    throttle: 500
  },
  progress: {
    minimum: 0.08,
    easing: 'linear',
    speed: 200,
    trickle: true,
    threshold: 500,
    trickleSpeed: 200
  }
};

/**
 * Connects
 *
 * Determines the connection of various observers
 * and logic required for the Pjax instance.
 *
 * 1. Controller
 * 2. History
 * 3. Href
 * 4. Hover
 * 5. Intersect
 * 6. Scroll
 * 7. Proximity
 * 8. Head
 */
export const connect: Set<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8> = new Set();

/**
 * Selectors
 *
 * String `key > value` references to DOM attributes
 * selectors used in the Pjax instance.
 */
export const schema: ISelectors = create(null);

/**
 * Position
 *
 * Holds the current position page offset radius.
 * The scroll position is updated and saved here.
 */
export const position: { x: number; y: number } = create(null);

/**
 * Pages
 *
 * Per-page state models. Each page uses a reference
 * configuration model. The objects in this store are
 * also available to the history API.
 */
export const pages: { [url: string]: IPage } = create(null);

/**
 * Snapshots
 *
 * This object holds documents responses of every page.
 * Each document is stored in string type. The key values
 * are unique ids generated using nanoid.
 */
export const snaps:{ [id: string]: string } = create(null);

/**
 * Events Model
 *
 * Holds an object reference for every event
 * emitted. Used by the event emitter operations
 */
export const events: { [name: string]: Array<() => void | boolean> } = create(null);

/**
 * Request Transits
 *
 * This object holds the XHR requests in transit. The object
 * properties represent the the request URL and the
 * value is the XML Request instance.
 */
export const transit: { [url: string]: XMLHttpRequest } = create(null);

/**
 * Tracked Elements
 *
 * Keeps a reference of tracked nodes between renders
 * and navigations to prevent extra appends from occuring.
 */
export const tracked: Set<string> = new Set();

/**
 * Request Timeouts
 *
 * Transit timers used to keep track of promises
 * and trigger operations like hover or proximity
 * prefetching.
 */
export const timers: { [url: string]: NodeJS.Timeout } = create(null);
