import { ILocation } from './location';
import { IPage } from './page';

/**
 * Prefetch Event
 */
export interface IPrefetch {
  /**
   * The `<a>` target element being fetched
   */
  target: HTMLLinkElement;
  /**
   * The key URL (pathname) identifier
   */
  url: string;
  /**
   * Location URL object
   */
  location: ILocation
}

/**
 * Trigger Event
 */
export interface ITrigger {
  /**
   * The clicked `<a>` target element
   */
  target: HTMLLinkElement;
}

/**
 * Request Event
 */
export interface IRequest {
  /**
   * The page state object
   */
  readonly state: IPage;
}

/**
 * Render Event
 */
export interface IRender {
  /**
   * The current target document
   */
  target: HTMLElement;
  /**
   * The fragment which will replace `target`
   */
  newTarget: HTMLElement;
}

/**
 * Hydrate Event
 */
export interface IHydrate {
  /**
   * The current target document
   */
  target: HTMLElement;
  /**
   * The new target document
   */
  hydration: HTMLElement;
}

/**
 * Load Event
 */
export interface ILoad {
  /**
   * The page state object
   */
  readonly state: IPage;
}

/**
 * Custom Event Wrapper
 */
export namespace PjaxEvent {
  /**
   * `pjax:prefetch`
   */
  export type Prefetch = CustomEvent<IPrefetch>;
  /**
   * `pjax:trigger`
   */
  export type Trigger = CustomEvent<ITrigger>;
  /**
   * `pjax:request`
   */
  export type Request = CustomEvent<IRequest>;
  /**
   * `pjax:render`
   */
  export type Render = CustomEvent<IRender>;
  /**
   * `pjax:hydrate`
   */
   export type Hydrate = CustomEvent<IHydrate>;
  /**
   * `pjax:load`
   */
   export type Load = CustomEvent<ILoad>;
}
