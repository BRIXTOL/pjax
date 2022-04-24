import { IHover } from 'types';
import { supportsPointerEvents } from 'detect-it';
import { forEach, hasProp } from '../shared/utils';
import { emit } from '../app/events';
import { config, observers, selectors } from '../app/session';
import * as store from '../app/store';
import * as request from '../app/fetch';
import { getKey, getRoute } from '../app/route';
import { getLink, getTargets } from '../shared/links';
import { EventType } from '../shared/enums';

/**
 * Cancels prefetch, if mouse leaves target before threshold
 * concludes. This prevents fetches being made for hovers that
 * do not exceeds threshold.
 */
function onMouseLeave (event: MouseEvent) {

  const target = getLink(event.target, selectors.hover);

  if (target) {
    request.cleanup(getKey(target.href));
    handleHover(target);
  }

};

/**
 * Attempts to visit location, Handles bubbled mouseovers and
 * Dispatches to the fetcher. Once item is cached, the mouseover
 * event is removed.
 *
 * @param {MouseEvent} event
 */
function onMouseEnter (event: MouseEvent): void {

  const target = getLink(event.target, selectors.hover);
  if (!target) return;

  const route = getRoute(target, EventType.HOVER);

  if (hasProp(request.timers, route.key)) return;
  if (store.has(route.key)) return removeListener(target);

  handleLeave(target);

  const state = store.create(route);
  const delay = state.threshold || (config.hover as IHover).threshold;

  request.throttle(route.key, function () {

    if (!emit('prefetch', target, route)) return removeListener(target);

    request.fetch(state).then(function (prefetch) {
      return prefetch
        ? removeListener(target) : null;
    });

  }, delay);

};

/**
 * Attach mouseover events to all defined element targets
 */
function handleHover (target: EventTarget): void {

  if (supportsPointerEvents) {
    target.addEventListener('pointerenter', onMouseEnter, false);
  } else {
    target.addEventListener('mouseenter', onMouseEnter, false);
  }
};

/**
 * Cancels prefetch, if mouse leaves target before threshold
 * concludes. This prevents fetches being made for hovers that
 * do not exceeds threshold.
 */
function handleLeave (target: Element): void {

  if (supportsPointerEvents) {
    target.addEventListener('pointerout', onMouseLeave, false);
    target.removeEventListener('pointerenter', onMouseEnter, false);
  } else {
    target.addEventListener('mouseleave', onMouseLeave, false);
    target.removeEventListener('mouseenter', onMouseEnter, false);
  }
}

/**
 * Adds and/or Removes click events.
 */
function removeListener (target: EventTarget): void {

  if (supportsPointerEvents) {
    target.removeEventListener('pointerenter', onMouseEnter, false);
    target.removeEventListener('pointerout', onMouseLeave, false);
  } else {
    target.removeEventListener('mouseleave', onMouseLeave, false);
    target.removeEventListener('mouseenter', onMouseEnter, false);
  }
}

/**
 * Starts mouseovers, will attach mouseover events
 * to all elements which contain a `data-spx-prefetch="hover"`
 * data attribute
 */
export function connect (): void {

  if (!config.hover || observers.hover) return;

  forEach(handleHover, getTargets(selectors.hover));

  observers.hover = true;

}

/**
 * Stops mouseovers, will remove all mouseover and mouseout
 * events on elements which contains a `data-spx-prefetch="hover"`
 * unless target href already exists in cache.
 */
export function disconnect (): boolean {

  if (!observers.hover) return;

  forEach(removeListener, getTargets(selectors.hover));

  observers.hover = false;

};
