/* eslint-disable no-unused-vars */

/**
 * Event type ids
 */
export const enum StoreType {
  /**
   * Store was created on initial run
   */
  INITIAL = 1,
  /**
   * Store was created from trigger visit
   */
  VISIT = 2,
  /**
   * Store was created from a prefetch
   */
  PREFETCH = 3,
  /**
   * Store was created from a preload visit
   */
  PRELOAD = 4,
  /**
   * Store was created from a reverse cache visit
   */
  REVERSE = 5,
  /**
   * Store was created from a hydration
   */
  HYDRATE = 6,
}

/**
 * Event type ids
 */
export const enum EventType {
  /**
   * Request is a click/mousedown event
   */
  TRIGGER = 1,
  /**
   * Request is a prefetch hover
   */
  HOVER = 2,
  /**
   * Request is a prefetch intersection
   */
  INTERSECT = 3,
  /**
   * Request is a prefetch proximity
   */
  PROXIMITY = 4,
  /**
   * Request is a pre-emptive preload
   */
  PRELOAD = 5,
  /**
   * Request is a reverse lastpath fetch
   */
  REVERSE = 6,
  /**
   * Request is a popstate fetch
   */
  POPSTATE = 7,
  /**
   * Request is reload fetch
   */
  RELOAD = 8,
  /**
   * Request is programmatic prefetch
   */
  PREFETCH = 9,
}
