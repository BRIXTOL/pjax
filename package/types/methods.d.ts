import { IPage } from './page';
import { IOptions } from './options';
import { EventNames, LifecycleEvent } from './events';

/**
 * Supported
 *
 * Boolean to determine whether or the browser supports
 * this module.
 */
export const supported: boolean;

/**
 * Connect
 *
 * Establish a SPX connection with your web application.
 * Optionally pass in connect options.
 */
export function connect(options?: IOptions): void;

/**
 * Session
 *
 * Returns the current session instance. This includes all state,
 * snapshots, options and settings which exists in memory. If you
 * intend of augmenting the session, please note that the store records
 * are created without prototype.
 */
export function session(key?: string, merge?: object): object

/**
 * Reload
 *
 * Triggers a reload of the current page. The page will be
 * re-fetched over HTTP and re-cached.
 */
export function reload(): Promise<IPage>;

/**
 * Event Listener
 *
 * Lifecycle event hook listener. Events are dispatched upon each
 * navigation. If you have multiple listeners they will trigger in
 * the order they are defined.
 */
export function on<T extends EventNames>(event: T, callback: LifecycleEvent<T>): void

/**
 * State
 *
 * View or modify page state record.
 */
export function state (key?: string, store?: IPage): { page: IPage, dom: Document }

/**
 * Capture
 *
 * Performs a snapshot modification to the current document. Use
 * this to align a snapshot cache record between navigations. This
 * is helpful in situations where the dom is augmented and you want
 * to preserve the current DOM.
 */
export function capture(targets?: Element[]): Element[]

/**
 * Hydrate
 *
 * Programmatic hydrate execution. The method expects a `url` and string list
 * of element selectors to be replaced.
 */
export function hydrate(url: string, elements: string[]): Promise<IPage>

/**
 * Prefetch
 *
 * Executes a programmatic prefetch. The method expects a `url` or `<a href="">`
 * node as an argument. This method behaves the same way as hover, intersect
 * or proximity prefetch.
 */
export function prefetch(link: string | Element): Promise<IPage>

/**
 * Visit
 *
 * Executes a programmatic visit. The method optionally
 * accepts a page state modifier as second argument.
 */
export function visit(link: string | Element, state?: IPage): Promise<IPage>;

/**
 * Fetch
 *
 * Executes a programmatic fetch. The XHR request response is not
 * cached and no state references are touched. The XHR response is
 * returned as DOM.
 */
export function fetch(url: string): Promise<Document>

/**
 * Clear
 *
 * Removes a cache references. Optionally clear a specific
 * record by passing a url key reference.
 */
export function clear(url?: string): void;

/**
 * Disconnect
 *
 * Disconnects SPX, purges all records in memory and
 * removes all observer listeners.
 */
export function disconnect(): void;
