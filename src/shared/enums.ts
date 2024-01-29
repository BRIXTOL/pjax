/* eslint-disable no-unused-vars */

/**
 * Attribute Selectors
 */
export enum Attributes {
  /**
   * Regex Capture Attribute List
   */
  NAMES = 'hydrate|append|prepend|target|progress|threshold|scroll|position|proximity|hover|cache',
}

export enum Refs {
  /**
   * An SPX Component, eg: `spx-component=""`
   */
  COMPONENT = 99,
  /**
   * An SPX Event Node, eg: `spx@click=""`
   */
  EVENT = 101,
  /**
   * An SPX Node, eg: `spx-node=""`
   */
  NODE = 110,
    /**
   * An SPX Binding, eg: `spx-bind=""`
   */
  BINDING = 98
}

export enum Nodes {
  /**
   * An elements node, eg: `<div>`
   */
  ELEMENT_NODE = 1,
  /**
   * A document fragment node
   */
  FRAGMENT_NODE = 11,
  /**
   * A text node
   */
  TEXT_NODE = 3,
  /**
   * A Comment node
   */
  COMMENT_NODE = 8,
}

/**
 * Error Types
 */
export enum Errors {

  /**
   * Prints trace info to console (does not throw)
   */
  TRACE = 1,

  /**
   * Prints info to console (does not throw)
   */
  INFO = 2,
  /**
   * Prints warning to console (does not throw)
   */
  WARN = 3,
  /**
   * Prints error to console (will throw TypeError)
   */
  TYPE = 4,
  /**
   * Prints error to console (will throw Error)
   */
  ERROR = 5
}

/**
 * Event type IDs. Event types are categorizes
 * into different _kinds_ which inform upon the
 * action which has takes place.
 *
 * Reference ()
 *
 * A `reference` event type refers to an action which has taken place.
 *
 * Trigger
 *
 * A `trigger` event type refers to a visit operation of intent, like a link click.
 *
 * Prefetch
 *
 * A `prefetch` event type refers to an fetch operation which an occured from an observer.
 *
 * Fetch
 *
 * A `fetch` event type refers to a request operation of some kind, like a programmatic fetch.
 */
export enum EventType {
  /**
   * Store was created on initial run
   *
   * @kind `reference`
   */
  INITIAL,
  /**
   * Request is programmatic prefetch
   *
   * @kind `reference`
   */
  PREFETCH,
  /**
   * Programmatic fetch triggered
   *
   * @kind `reference`
   */
  FETCH,
  /**
   * Request is a pre-emptive preload
   *
   * @kind `fetch`
   */
  PRELOAD,
  /**
   * Request is a reverse lastpath fetch
   *
   * @kind `fetch`
   */
  REVERSE,
  /**
   * Request is a popstate fetch
   *
   * @kind `fetch`
   */
  POPSTATE,
  /**
   * Store was created from trigger visit.
   *
   * @kind `trigger`
   */
  VISIT,
  /**
   * Store was created from a hydration
   *
   * @kind `trigger`
   */
  HYDRATE,
  /**
   * Snapshot is recaptured
   *
   * @kind `trigger`
   */
  CAPTURE,
  /**
   * Request is reload fetch
   *
   * @kind `trigger`
   */
  RELOAD,
  /**
   * Request is a prefetch hover
   *
   * @kind `prefetch`
   */
  HOVER,
  /**
   * Request is a prefetch intersection
   *
   * @kind `prefetch`
   */
  INTERSECT,
  /**
   * Request is a prefetch proximity
   *
   * @kind `prefetch`
   */
  PROXIMITY
}
