import { LiteralUnion } from 'type-fest';

export type Key = '/' | `${'/' | '?'}${string}`

export interface IHover {
  /**
   * How mousover prefetches should be triggered. By default this option is set
   * to trigger on all `<a>` href link elements. You can instead use the `attribute`
   * option and only prefetch on href link elements that are annotated with a
   * `data-spx-mouseover` or `data-spx-mouseover="true"` attribute.
   *
   * > If you set the trigger to `href` you can annotate links you wish to exclude
   * from prefetch with `data-spx-mouseover="false"`.
   *
   * ---
   *
   * @default 'href'
   */
  trigger?: 'attribute' | 'href'

  /**
   * Controls the fetch delay threshold. Requests will fire
   * only when the mouse is both within range and the threshold
   * time limit defined here has exceeded.
   *
   * ---
   * @default 100
   */
  threshold?: number;

}

export interface IIntersect {
  /**
   * An offset rectangle applied to the root's href bounding box.
   *
   * ---
   * @default '0px 0px 0px 0px'
   */
  rootMargin?: string;
  /**
   * Threshold limit passed to the intersection observer instance
   *
   * ---
   * @default 0
   */
  threshold?: number;
}

export interface IProximity {
  /**
   * The distance range the mouse should be within before
   * the prefetch is triggered. You can optionally override
   * this by assigning a number value to the proximity attribute.
   *
   * For example:
   *
   * An href element using `data-spx-proximity="50"` would infrom
   * SPX to begin fetching when the mouse is within 50px of the
   * element.
   *
   * ---
   * @default 75
   */
  distance?: number;
  /**
   * Controls the fetch delay threshold. Requests will fire
   * only when the mouse is both within range and the threshold
   * time limit defined here has exceeded.
   *
   * ---
   * @default 100
   */
  threshold?: number;
  /**
   * Controls the mouseover trigger throttle. This helps limit the amount of
   * times an internal callback fires once cursor is in range. It is highly
   * discouraged to set this to a limit less than 250ms.
   *
   * _Generally speaking, leave this the fuck alone._
   *
   * ---
   *
   * @default 500
   */
   throttle?: number;
}

export interface IProgress {
  /**
   * The progress bar color
   *
   * @default #111111
   */
  background?: string;
  /**
   * The progress bar height in pixels.
   *
   * @default 3px
   */
  height?: `${string}px`;
  /**
   * Changes the minimum percentage used upon starting.
   *
   * @default 0.08
   */
  minimum?: number;
  /**
   * CSS Easing String
   *
   * @default linear
   */
  easing?: string;
  /**
   * Animation Speed
   *
   * @default 200
   */
  speed?: number;
  /**
   * Turn off the automatic incrementing behavior
   * by setting this to false.
   *
   * @default true
   */
  trickle?: boolean;
  /**
   * Adjust how often to trickle/increment, in ms.
   *
   * @default 200
   */
  trickleSpeed?: number;
  /**
   * Controls the progress bar preset threshold. Defines the amount of
   * time to delay before the progress bar is shown.
   *
   * ---
   * @default 350
   */
  threshold?: number;
}

export interface IOptions {
  /**
   * Define page the selector schema
   *
   * ---
   *
   * @default 'SPX'
   */
  schema?: string;

  /**
   * Define page fragment targets. By default, this SPX module will replace the
   * entire `<body>` fragment, if undefined. Its best to define specific fragments.
   *
   * ---
   *
   * @default ['body']
   */
  targets?: string[];

  /**
   * The timeout limit of the XHR request issued. If timeout limit is exceeded a
   * normal page visit will be executed.
   *
   * ---
   *
   * @default 30000
   */
  timeout?: number;

  /**
   * Request polling limit is used when a request is already in transit. Request
   * completion is checked every 10ms, by default this is set to 150 which means
   * requests will wait 1500ms before being a new request is triggered.
   *
   * **BEWARE**
   *
   * Timeout limit will run precedence!
   *
   * ---
   *
   * @default 150
   */
  poll?: number;

  /**
   * Determin if page requests should be fetched asynchronously or synchronously.
   * Setting this to `false` is not reccomended.
   *
   * ---
   *
   * @default true
   */
  async?: boolean;

  /**
   * Enable or Disable caching. Each page visit request is cached and used in
   * subsequent visits to the same location. By disabling cache, all visits will
   * be fetched over the network and any `data-spx-cache` attribute configs
   * will be ignored.
   *
   * ---
   * @default true
   */
  cache?: boolean;

  /**
   * Cache size limit. This SPX variation limits cache size to `50mb`and once size
   * exceeds that limit, records will be removed starting from the earliest point
   * of the cache entries.
   *
   * _Generally speaking, leave this the fuck alone._
   *
   * ---
   *
   * @default 50
   */
  limit?: number;

  /**
   * Session
   *
   * ---
   *
   * @default 50
   */
  session?: LiteralUnion<'persist' | 'renew', string>

  /**
   * Anticipatory preloading (prefetches). Values defined here will be fetched
   * preemptively and saved to cache either upon initial load or when a specific path is
   * visited. If you provide an array list of paths those pages will be visited
   * asynchronously in the order they were passed after. If you provide an object,
   * preemptive fetches will be carried out when path match occurs based on the
   * `key` entry provided.
   *
   * ---
   *
   * @default null
   */
  preload?: Key[] | { [key: Key]: Key[] }

  /**
   * Mouseover prefetching. You can disable mouseover (hover) prefetching
   * by setting this to `false` otherwise you can customize the fetching
   * behaviour. To use the default behaviour, set this to `true`. When enabled,
   * this option will allow you to fetch pages over the wire upon mouseover and
   * saves them to cache.
   *
   * > If `cache` is disabled then prefetches will be dispatched using HTML5
   * `<link>` prefetches, else when cache is enabled it uses XHR.
   *
   * ---
   *
   * @default true
   */
  hover?: boolean | IHover;

  /**
   * Intersection pre-fetching. Intersect prefetching leverages the
   * [Intersection Observer](https://shorturl.at/drLW9) API to fire requests when
   * elements become visible in viewport. You can disable intersect prefetching
   * by setting this to `false` (default), otherwise you can customize the
   * intersect fetching behaviour.
   *
   * To use default behaviour, set this to `true` and all elements annotated with
   * with a `data-spx-intersect` or `data-spx-intersect="true"` attribute will be
   * prefetched. You can annotate nodes containing href links or `<a>` directly.
   *
   * > Annotate any `<a>` links you wish to exclude from intersection prefetching
   * using the `data-spx-intersect="false"`
   *
   * ---
   *
   * @default true
   */
  intersect?: boolean | IIntersect;
  /**
   * Proximity pre-fetching allow for requests to be dispatched when the cursor is within
   * a proximity range of a href link element. Coupling proximity with mouseover prefetches
   * enable predicative fetching to occur, so a request will trigger before any interaction.
   *
   * To use default behaviour, set this to `true` and all `<a>` annotated with
   * with a `data-spx-proximity` or `data-spx-proximity="true"` attribute will be
   * prefetched.
   *
   * > Annotate any `<a>` links you wish to exclude from intersection prefetching
   * using the `data-spx-proximity="false"`
   *
   * ---
   * @default true
   */
  proximity?: boolean | IProximity;
  /**
   * Progress Bar configuration
   */
  progress?: boolean | IProgress

}
