import { supportsPointerEvents } from 'detect-it';
import { getLink, getTargets, forEach, emptyObject } from '../app/utils';
import { emit } from '../app/events';
import { connect, config, schema, timers } from '../app/state';
import * as store from '../app/store';
import * as request from '../app/request';
import { getKey, getRoute } from '../app/route';
import { EventType, StoreType } from '../constants/enums';

/**
 * Cancels prefetch, if mouse leaves target before threshold
 * concludes. This prevents fetches being made for hovers that
 * do not exceeds threshold.
 */
function onMouseLeave (event: MouseEvent) {

  const target = getLink(event.target, schema.mouseover);

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

  const target = getLink(event.target, schema.mouseover);
  if (!target) return;

  const route = getRoute(target, StoreType.PREFETCH);

  if (route.key in timers) return;
  if (store.has(route.key)) return disconnect(target);

  handleLeave(target);

  const state = store.create(route);
  const delay = state.threshold || config.hover.threshold;

  request.throttle(route.key, async () => {

    if (!emit('prefetch', target, route, EventType.HOVER)) return disconnect(target);

    const prefetch = await request.get(state, EventType.HOVER);

    if (prefetch) disconnect(target);

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
function disconnect (target: EventTarget): void {

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
 * to all elements which contain a `data-pjax-prefetch="hover"`
 * data attribute
 */
export function start (): void {

  if (!config.hover || connect.has(4)) return;

  forEach(handleHover, getTargets(schema.mouseover));
  connect.add(4);

}

/**
 * Stops mouseovers, will remove all mouseover and mouseout
 * events on elements which contains a `data-pjax-prefetch="hover"`
 * unless target href already exists in cache.
 */
export function stop (): void {

  if (!connect.has(4)) return;

  emptyObject(timers);
  forEach(disconnect, getTargets(schema.mouseover));
  connect.delete(4);

};
