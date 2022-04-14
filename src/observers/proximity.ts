import { supportsPointerEvents } from 'detect-it';
import { config, connect, schema } from '../app/state';
import { getTargets } from '../app/utils';
import { create } from '../constants/native';
import { isNumber } from '../constants/regexp';
import { getRoute } from '../app/route';
import { emit } from '../app/events';
import * as store from '../app/store';
import * as request from '../app/request';
import { EventType, StoreType } from '../constants/enums';

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

function setBounds (target: HTMLLinkElement) {

  const o = create(null);
  const rect = target.getBoundingClientRect();
  const attr = target.getAttribute(`${config.schema}-proximity`);
  const distance = isNumber.test(attr) ? Number(attr) : config.proximity.distance;

  o.target = target;
  o.top = rect.top - distance;
  o.bottom = rect.bottom + distance;
  o.left = rect.left - distance;
  o.right = rect.right + distance;

  return o;

}

/**
 * Observes mouse movements and awaiting for the mouse to enter
 * bounds. One distance is a fetch is triggered.
 */
function observer (targets?: {
  target: Element,
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

      const { target } = targets[node];
      const page = store.create(getRoute(target, StoreType.PREFETCH));

      request.throttle(page.key, async () => {

        if (!emit('prefetch', target, page, EventType.PROXIMITY)) return stop();

        const prefetch = await request.get(page, EventType.PROXIMITY);

        if (prefetch) {

          targets.splice(node, 1);
          wait = false;

          if (targets.length === 0) {
            stop();
            console.info('Brixtol Pjax: Proximity observer has disconnected');
          }
        }

      }, page.threshold || config.proximity.threshold);
    }
  };
}

let entries: ReturnType<typeof observer>;

/**
 * Starts proximity prefetch, will parse all link nodes and
 * begin watching mouse movements.
 */
export function start (): void {

  if (!config.proximity || connect.has(7)) return;

  const targets = getTargets(schema.proximity).map(setBounds);

  if (targets.length > 0) {

    entries = observer(targets);

    if (supportsPointerEvents) {
      addEventListener('pointermove', entries, false);
    } else {
      addEventListener('mousemove', entries, false);
    }

    connect.add(7);
  }

}

/**
 * Stops prefetch, will remove pointer move event listener
 */
export function stop (): void {

  if (!connect.has(7)) return;

  if (supportsPointerEvents) {
    removeEventListener('pointermove', entries, false);
  } else {
    removeEventListener('mousemove', entries, false);
  }

  connect.delete(7);

};
