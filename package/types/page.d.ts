import type { EventType } from '../shared/enums';
import type { Key } from './options';
import type { LiteralUnion } from 'type-fest';

/**
 * Cache Size
 */
export interface ICacheSize {
  total: number;
  weight: string;
}

/**
 * Scroll position records
 */
export interface IPosition {
  x: number;
  y: number;
}

/**
 * The URL location object
 */
export interface ILocation {
  /**
   * The URL origin name
   *
   * @example
   * 'https://website.com'
   */
  origin: string;
  /**
   * The URL Hostname
   *
   * @example
   * 'website.com'
   */
  hostname: string;

  /**
   * The URL Pathname
   *
   * @example
   * '/pathname' OR '/pathname/foo/bar'
   */
  pathname: string;

  /**
   * The URL search params. If none exist this property
   * will be omitted.
   *
   * @example
   * '?param=foo&bar=baz'
   */
  search?: string;

  /**
   * The URL Hash. If none exists then this property
   * will be omitted.
   *
   * @example
   * '#foo'
   */
  hash?: string;
}

/**
 * Page Visit State
 *
 * Configuration from each page visit. For every page navigation
 * the configuration object is generated in a immutable manner.
 */
export interface IPage {
  /**
   * UUID reference to the page snapshot HTML Document element
   */
  uuid: string;

 /**
   * The session identifier. This is used to determine the
   * connection digest. It is a random 4 digit number. When
   * using a `persisted` session this is the id used by the
   * session storage and other internal logic.
   *
   * @example
   * 1001
   */
  session: string;

  /**
   * The number of visits made to this page
   *
   * @example
   * 1
   */
  visits: number;

  /**
   * The exit timestamp, ie: the last time page was viewed
   *
   * @example
   * 834916
   */
  ts: number;

  /**
   * The URL cache key and current url path
   *
   * @example
   * '/pathname' OR '/pathname?foo=bar'
   */
  key: LiteralUnion<Key, string>;

  /**
   * The previous page cache key url path. When this value
   * matches the `key` then it is a first visit.
   *
   * @example
   * '/pathname' OR '/pathname?foo=bar'
   */
  rev: LiteralUnion<Key, string>;

   /**
   * The forward page cache key url path. When this value
   * matches the `key` then it is a first visit.
   *
   * @example
    * '/pathname' OR '/pathname?foo=bar'
    */
  fwd: LiteralUnion<Key, string>;

  /**
   * A store type number reference which determines how the
   * record was saved. Used by events and internally
   */
  type: EventType;

  /**
   * The Document title. The value is written in the post-request
   * cycle before caching occurs.
   */
  title: string;

  /**
   * Scroll position of the next navigation, this field
   * will be updated according to history, which means
   * navigating away from this page will update this record.
   *
   * ---
   * - `x` - Equivalent to `scrollLeft` in pixels
   * - `y` - Equivalent to `scrollTop` in pixels
   */
   position: IPosition;

  /**
   * Location Records reference. This holds a parsed path
   * reference of the page.
   */
  location: ILocation;

 /**
   * Controls the caching engine for the link navigation.
   * Option is enabled when `cache` preset config is `true`.
   * Each href link can set a different cache option. Cache control
   * is only operational on visits (clicks). Prefetches have no
   * control of the cache operation.
   *
   * @default true
   */
  cache: boolean | 'reset' | 'clear' | 'restore';

  /**
   * List of additional fragment element selectors to target in the
   * render cycle. Accepts any valid `querySelector()` string.
   * The selectors defined here will be merged with the defined
   * `targets` set in connection.
   *
   * @example
   * ['#main', '.header', '[data-attr]', 'header']
   */
  replace: string[];

  /**
   * Progress bar threshold delay.
   *
   * @default 350
   */
  progress?: boolean | number;

  /**
   * Threshold timeout to be applied to `proximity` or `hover`
   * prefetch operations.
   *
   * @default 100
   */
  threshold?: number;

  /**
   * List of fragments to replace. When `hydrate` is used,
   * it will run precedence over `targets` and only execute
   * a replacement on the elements defined.
   *
   * @example
   * ['#main', '.header', '[data-attr]', 'header']
   */
  hydrate?: string[];

  /**
   * List of fragments contained within targets to ignore in
   * the render cycle.
   *
   * **OPTION NOT YET AVAILABLE**
   *
   * @example
   * ['#ignore']
   */
  ignore?: string[]

  /**
   * List of fragments to be appened from and to. Accepts multiple.
   *
   * @example
   * [['#main', '.header'], ['[data-attr]', 'header']]
   */
  append?: Array<[from: string, to: string]>;

  /**
   * List of fragments to be prepend from and to. Accepts multiple.
   *
   * @example
   * [['#main', '.header'], ['[data-attr]', 'header']]
   */
  prepend?: Array<[from: string, to: string]>;

  /**
   * Define proximity prefetch distance from which fetching should
   * begin. This value is relative to the cursor offset of defined
   * elements using the `data-spx-proximity` attribute.
   *
   * @default 75
   */
  proximity?: number;

}
