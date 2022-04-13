import { IPage } from 'types';
import { config, connect, schema, timers } from '../app/state';
import { getTargets, emptyObject } from '../app/utils';
import { create } from '../constants/native';
import { getRoute } from '../app/route';
import * as store from '../app/store';
import * as request from '../app/request';

/**
 * Detects is the cursor (mouse) is in range of a
 * target element.
 */
function inRange ({ clientX, clientY }: MouseEvent, bounds: {
  top: number;
  bottom: number;
  left: number;
  right: number;
}) {

  return clientX <= bounds.right &&
    clientX >= bounds.left &&
    clientY <= bounds.bottom &&
    clientY >= bounds.top;
}

function setHrefBounds (target: HTMLLinkElement) {

  const o = create(null);
  const rect = target.getBoundingClientRect();

  o.state = getRoute(target);
  o.top = rect.top - (o.state.proximity || config.proximity.distance);
  o.bottom = rect.bottom + (o.state.proximity || config.proximity.distance);
  o.left = rect.left - (o.state.proximity || config.proximity.distance);
  o.right = rect.right + (o.state.proximity || config.proximity.distance);

  return o;

}

/**
 * Observes mouse movements and awaiting for the mouse to enter
 * bounds. One distance is a fetch is triggered.
 */
function observer (targets?: {
  get state(): IPage;
  top: number;
  bottom: number;
  left: number;
  right: number;
}[]) {

  let wait = false;

  return (event: MouseEvent) => {

    if (wait) return;

    wait = true;

    const node = targets.findIndex(node => inRange(event, node));

    if (node === -1) {
      setTimeout(() => { wait = false; }, config.proximity.throttle);
    } else {

      const state = store.create(targets[node].state);

      request.throttle(state.key, async () => {

        const prefetch = await request.get(state);

        if (prefetch) {

          targets.splice(node, 1);
          wait = false;

          if (targets.length === 0) {
            stop();
            console.info('Pjax: Proximity observer has disconnected');
          }
        }

      }, state.threshold || config.proximity.threshold);
    }
  };
}

let entries: ReturnType<typeof observer>;

/**
 * Starts proximity prefetch, will parse all link nodes and
 * begin watching mouse movements.
 */
export function start (): void {

  if (!config.proximity) return;
  if (connect.has(7)) return;

  const targets = getTargets(schema.proximity).map(setHrefBounds);

  if (targets.length > 0) {
    entries = observer(targets);
    addEventListener('mousemove', entries, false);
    connect.add(7);
  }

}

/**
 * Stops prefetch, will disconnect `IntersectionObserver` and
 * remove any event listeners or transits.
 */
export function stop (): void {

  if (!connect.has(7)) return;

  emptyObject(timers);
  removeEventListener('mousemove', entries, false);
  connect.delete(7);

};

// mouseNear.destory()
