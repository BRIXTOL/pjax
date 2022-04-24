import { IOptions, IProximity, IHover, IIntersect, IProgress } from './options';
import { IPage } from './page';

/**
 * Selectors
 *
 * String `key > value` references to DOM attributes
 * selectors used in the SPX instance.
 */
export interface ISelectors {
  attrs?: RegExp;
  script?: string;
  style?: string;
  styleLink?: string;
  hydrate?: string;
  track?: string;
  href?: string;
  hover?: string;
  intersect?: string;
  interHref?: string;
  proximity?: string;
}

/**
 * Memory
 *
 * Object reference which holds the storage memory
 * record throughout the SPX session.
 */
export interface IMemory {
  bytes: number;
  limit: number;
  visits: number;
}

/**
 * Observers
 *
 * Conditional reference object for observers.
 * Assigns a connection status to each observer.
 */
export interface IObservers {
  scroll?: boolean;
  history?: boolean;
  hrefs?: boolean;
  hover?: boolean;
  intersect?: boolean;
  proximity?: boolean;
}

/**
 * Configuration is internal, observers differ
 * from options. Observers either use a boolean
 * `false` when disabled of the merged defaults.
 */
export interface IConfig extends IOptions {
  hover?: false | IHover;
  intersect?: false | IIntersect;
  proximity?: false | IProximity;
  progress?: false | IProgress;
}

/**
 * History State
 *
 * Partial references extracted from the
 * page store. Written to the history stack API.
 */
type HistoryState = Omit<IPage, (
  | 'hydrate'
  | 'append'
  | 'prepend'
  | 'proximity'
  | 'threshold'
  | 'ignore'
)>

/**
 * History API
 *
 * An overwrite of the History API. Applied to
 * the native exports using `as` type.
 */
export type History = {
  readonly length: number;
  scrollRestoration: ScrollRestoration;
  state: HistoryState;
  back(): void;
  forward(): void;
  go(delta?: number): void;
  pushState(data: HistoryState, unused: string, url?: string | URL | null): void;
  replaceState(data: HistoryState, unused: string, url?: string | URL | null): void;
};
