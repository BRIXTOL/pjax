import { forEach, getNodeTargets } from '../app/utils';
import { emit } from '../app/events';
import { getRoute } from '../app/route';
import { config, connect, schema } from '../app/state';
import * as request from '../app/request';
import * as store from '../app/store';
import { EventType, StoreType } from '../constants/enums';

/**
 * @type IntersectionObserver
 */
let entries: IntersectionObserver;

/**
 * Intersection callback when entries are in viewport.
 */
async function onIntersect (entry: IntersectionObserverEntry): Promise<void> {

  if (entry.isIntersecting) {

    const route = getRoute(entry.target, StoreType.PREFETCH);

    if (!emit('prefetch', entry.target, route, EventType.INTERSECT)) {
      return entries.unobserve(entry.target);
    }

    const response = await request.get(store.create(route), EventType.INTERSECT);

    if (response) {
      entries.unobserve(entry.target);
    } else {
      console.warn(`Pjax: Prefetch will retry at next intersect for: ${route.key}`);
      entries.observe(entry.target);
    }
  }
};

/**
 * Starts prefetch, will initialize `IntersectionObserver` and
 * add event listeners and other logics.
 */
export function start (): void {

  if (!config.intersect || connect.has(5)) return;

  entries = new IntersectionObserver(forEach(onIntersect));
  forEach(entries.observe, getNodeTargets(schema.intersect, schema.interhref));
  connect.add(5);

}

/**
 * Stops prefetch, will disconnect `IntersectionObserver` and
 * remove any event listeners or transits.
 */
export function stop (): void {

  if (!connect.has(5)) return;

  entries.disconnect();
  connect.has(5);

};
