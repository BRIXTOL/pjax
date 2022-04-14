/* eslint-disable no-unused-vars */

import { IPage } from './page';

/**
 * Pjax Events
 */
export type EventNames = (
 | 'connected'
 | 'prefetch'
 | 'trigger'
 | 'request'
 | 'cache'
 | 'hydrate'
 | 'tracked'
 | 'render'
 | 'load'
);

/**
 * Event Type
 *
 * Enum number value is passed. Below is the id reference
 *
 * 1. Click/Mousedown event
 * 2. Prefetch hover event
 * 3. Prefetch intersection
 * 4. Prefetch proximity
 * 5. Prefetch preload
 * 6. Reverse cache fetch (lastpath)
 * 7. Popstate fetch
 * 8. Programmatic reload (method trigger)
 * 9. Programmatic prefetch (method trigger)
 */
export type EventType = (
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
)

/**
 * Emitter Arguments
 */
export type EmitterArguments<T extends EventNames> = (
  T extends 'connected' ? [
    state: IPage
  ] :
  T extends 'trigger' ? [
    event: MouseEvent,
    state: IPage
  ] :
  T extends 'prefetch' ? [
    target: Element,
    state: IPage,
    type: EventType
  ] :
  T extends 'request' ? [
    state: IPage,
    type: EventType
  ] :
  T extends 'cache' ? [
    state: IPage,
    snapshot: string
  ] :
  T extends 'hydrate' ? [
    element: Element,
    newElement: Element
  ] :
  T extends 'render' ? [
    element: Element,
    newElement: Element
  ] :
  T extends 'load' ? [
    state: IPage
  ] : never
)

/**
 * Lifecycle Events
 */
export type LifecycleEvent<T extends EventNames> = (

  T extends 'connected' ? (
    /**
     * Page state reference
     */
    state?: IPage
  ) => void :

  T extends 'trigger' ? (
    /**
     * The mouse event, access target via `event.target`
     */
    event?: MouseEvent,
    /**
     * Page state reference
     */
    route?: IPage

  ) => void | false :

  T extends 'prefetch' ? (
    /**
     * Page state reference
     */
    state?: IPage,
    /**
     * Event dispatch type id
     */
    type?: Exclude<EventType, 'trigger'>

  ) => void | false :

  T extends 'request' ? (
    /**
     * Page state reference
     */
     state?: IPage,
     /**
      * Event dispatch type id
      */
     type?: EventType

  ) => void | false :

  T extends 'cache' ? (
    /**
     * Page state reference
     */
    state?: IPage,
    /**
     * Parsed document snapshot. Augment the snapshot
     * by returning the document.
     */
    snapshot?: Document

  ) => void | false | Document :

  T extends 'hydrate' ? (
    /**
     * The target element that will be replaced
     */
    element?: Element,
    /**
     * The element replacing the current target
     */
    newElement?: Element

  ) => void | false :

  T extends 'render' ? (
    /**
     * The target element that will be replaced
     */
     element?: Element,
     /**
      * The element replacing the current target
      */
     newElement?: Element

  ) => void | false :

  T extends 'load' ? (
    /**
     * Page state reference
     */
    state?: IPage

  ) => void : never
)
