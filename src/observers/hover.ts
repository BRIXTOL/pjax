import { supportsPointerEvents } from 'detect-it';
import { getLink, getTargets, forEach, emptyObject } from '../app/utils';
import { emit } from '../app/events';
import { connect, config, schema, timers } from '../app/state';
import * as store from '../app/store';
import * as request from '../app/request';
import { getKey, getRoute } from '../app/route';

/**
 * Cancels prefetch, if mouse leaves target before threshold
 * concludes. This prevents fetches being made for hovers that
 * do not exceeds threshold.
 */
function onMouseleave (event: MouseEvent) {

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

  const route = getRoute(target, 'hover');

  if (route.key in timers) return;
  if (store.has(route.key)) return disconnect(target);

  handleLeave(target);

  const state = store.create(route);

  request.throttle(route.key, async () => {

    if (!emit('prefetch', target, route, 'hover')) return disconnect(target);

    const prefetch = await request.get(state);

    if (prefetch) disconnect(target);

  }, state.threshold || config.hover.threshold);

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
    target.addEventListener('pointerout', onMouseleave, false);
    target.removeEventListener('pointerenter', onMouseEnter, false);
  } else {
    target.addEventListener('mouseleave', onMouseleave, false);
    target.removeEventListener('mouseenter', onMouseEnter, false);
  }
}

/**
 * Adds and/or Removes click events.
 */
function disconnect (target: EventTarget): void {

  if (supportsPointerEvents) {
    target.removeEventListener('pointerenter', onMouseleave, false);
    target.removeEventListener('pointerout', onMouseEnter, false);
  } else {
    target.removeEventListener('mouseleave', onMouseleave, false);
    target.removeEventListener('mouseenter', onMouseEnter, false);
  }
}

/**
 * Starts mouseovers, will attach mouseover events
 * to all elements which contain a `data-pjax-prefetch="hover"`
 * data attribute
 */
export function start (): void {

  if (!config.hover) return;

  if (!connect.has(4)) {
    forEach(handleHover, getTargets(schema.mouseover));
    connect.add(4);
  }

}

/**
 * Stops mouseovers, will remove all mouseover and mouseout
 * events on elements which contains a `data-pjax-prefetch="hover"`
 * unless target href already exists in cache.
 */
export function stop (): void {

  if (connect.has(4)) {
    emptyObject(timers);
    forEach(disconnect, getTargets(schema.mouseover));
    connect.delete(4);
  }

};
