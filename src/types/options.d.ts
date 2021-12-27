import { IProgress } from './progress';

export interface IOptions {
  /**
   * Define page fragment targets. By default, this pjax module will replace the
   * entire `<body>` fragment, if undefined. Its best to define specific fragments.
   *
   * ---
   *
   * @default ['body']
   */
  targets?: string[];

  /**
   * Request Configuration
   */
  request?: {

    /**
     * The timeout limit of the XHR request issued. If timeout limit is exceeded a
     * normal page visit will be executed.
     *
     * ---
     *
     * @default 3000
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
     * **FEATURE NOT YET AVAILABLE**
     *
     * Define the request dispatch. By default, requests are fetched upon mousedown, this allows
     * fetching to start sooner that it would from an click event.
     *
     * > Currently, fetches are executed on `mousedown` only. Future releases will provide click
     * dispatches
     *
     * ---
     *
     * @default 'mousedown'
     */
    readonly dispatch?: 'mousedown';
  };

  /**
   * Prefetch configuration
   */
  prefetch?: {

    /**
     * Anticipatory prefetches. Values defined here will be fetched preemptively
     * and saved to cache either upon initial load or when a specific path is
     * visited. If you provide an array list of paths those pages will be visited
     * asynchronously in the order they were passed after. If you provide an object,
     * preemptive fetches will be carried out when path match occurs based on the
     * `key` entry provided.
     *
     * ---
     *
     * @default nul
     */
    preempt?: string[] | { [path: string]: string[] }

    /**
     * Mouseover prefetching preset configuration
     */
    mouseover?: {
      /**
       * Enable or Disable mouseover (hover) prefetching. When enabled, this option
       * will allow you to fetch pages over the wire upon mouseover and saves them to
       * cache. When `mouseover` prefetches are disabled, all `data-pjax-prefetch="mouseover"`
       * attribute configs will be ignored.
       *
       * > _If cache if disabled then prefetches will be dispatched using HTML5
       * `<link>` prefetches, else when cache is enabled it uses XHR._
       *
       * ---
       *
       * @default true
       */
      enable?: boolean;

      /**
       * Whether or not mouseover (hover) prefetching should be triggered on
       * link elements annotated with `data-pjax-prefetch="mouseover"` or trigger
       * on all `<a>` href link elements.
       *
       * > If you set the trigger to `href` you can annotate links you wish to exclude
       * from prefetch with `data-pjax-prefetch="false"`.
       *
       * ---
       *
       * @default 'href'
       */
      trigger?: 'attribute' | 'href'

      /**
       * Controls the mouseover fetch delay threshold. Requests will fire on mouseover
       * only after the threshold time has been exceeded. This helps limit extrenous
       * requests from firing.
       *
       * ---
       * @default 250
       */
      threshold?: number;

      /**
       * **FEATURE NOT YET AVAILABLE**
       *
       * Proximity hovers allow for prefetch hovers to be dispatched when the cursor is within
       * a proximity range of a href link element. Coupling proximity with mouseover prefetches
       * enable predicative fetching to occur, so a request will trigger before any interaction.
       *
       * ---
       * @default 0
       */
      readonly proximity?: number;
    };

    /**
     * Intersection prefetching preset configuration
     */
    intersect?: {
      /**
       * Enable or disable intersection prefetching. Intersect prefetching leverages the
       * Intersection Observer API to fire requests when elements become visible in viewport.
       * When intersect prefetch is disabled, all `data-pjax-prefetch="intersect"`
       * attribute configs will be ignored.
       *
       * > _If cache if disabled then prefetches will be dispatched using HTML5
       * `<link>` prefetches, else when cache is enabled it uses XHR._
       *
       * ---
       * @default true
       */
      enable?: boolean;

      /**
       * Partial options passed to [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
       *
       */
      options?: {
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
      };

    };
  };

  /**
   * Caching engine configuration
   */
  cache?: {
    /**
     * Enable or Disable caching. Each page visit request is cached and used in
     * subsequent visits to the same location. By disabling cache, all visits will
     * be fetched over the network and any `data-pjax-cache` attribute configs
     * will be ignored.
     *
     * ---
     * @default true
     */
    enable?: boolean;

    /**
     * Cache size limit. This pjax variation limits cache size to `25mb`and once size
     * exceeds that limit, records will be removed starting from the earliest point
     * cache entry.
     *
     * _Generally speaking, leave this the fuck alone._
     *
     * ---
     *
     * @default 50
     */
    limit?: number;

    /**
     * Reverse caching. This will execute a premptive fetch of the previous
     * pages in the history stack when no snapshot exists in cache. Snapshots cache
     * is purged if a browser refresh occurs and when navigating backwards or
     * pages will need to be re-fetched resulting in minor delays if a refresh
     * was triggered between browsing.
     *
     * By default, the last known previous page in the history stack is fetched
     * and re-cached when no snapshot exists.
     *
     * ---
     *
     * @default true
     */
    reverse?: boolean;

    /**
     * **FEATURE NOT YET AVAILABLE**
     *
     * The save option will save snapshot cache to IndexedDB.
     * This feature is not yet available.
     *
     * ---
     *
     * @default false
     */
    readonly save?: boolean;

  };

  /**
   * Progress Bar configuration
   */
  progress?: IProgress;

}
