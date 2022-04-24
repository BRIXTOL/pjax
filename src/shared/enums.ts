/* eslint-disable no-unused-vars */

/**
 * Attribute Selectors
 */
export enum Attributes {
  /**
   * Regex Capture Attribute List
   */
  NAMES = 'hydrate|append|prepend|replace|progress|threshold|position|proximity|hover',
}

/**
 * Error Types
 */
export enum Errors {

  /**
   * Prints info to console (does not thrown)
   */
  INFO = 1,
  /**
   * Prints warning to console (does not throw)
   */
  WARN = 2,
  /**
   * Prints error to console (will throw TypeError)
   */
  TYPE = 3,
  /**
   * Prints error to console (will throw Error)
   */
  ERROR = 4
}

/**
 * Event type ids
 */
export enum EventType {
  /**
   * Store was created on initial run
   */
  INITIAL = 1,
  /**
   * Store was created from trigger visit
   */
  VISIT,
  /**
   * Store was created from a hydration
   */
  HYDRATE,
  /**
   * Request is a prefetch hover
   */
  HOVER,
  /**
   * Request is a prefetch intersection
   */
  INTERSECT,
  /**
   * Request is a prefetch proximity
   */
  PROXIMITY,
  /**
   * Request is a pre-emptive preload
   */
  PRELOAD,
  /**
   * Request is a reverse lastpath fetch
   */
  REVERSE,
  /**
   * Request is a popstate fetch
   */
  POPSTATE,
  /**
   * Request is reload fetch
   */
  RELOAD,
  /**
   * Request is programmatic prefetch
   */
  PREFETCH,
  /**
   * Snapshot is recaptured
   */
  CAPTURE,
  /**
   * Programmatic fetch triggered
   */
  FETCH,
}
