import { supportsPointerEvents } from 'detect-it';
import { config, observers, selectors } from '../app/session';
import { getTargets } from '../shared/links';
import { object } from '../shared/native';
import { isNumber } from '../shared/regexp';
import { log } from '../shared/utils';
import { getRoute } from '../app/route';
import { emit } from '../app/events';
import * as store from '../app/store';
import * as request from '../app/fetch';
import { EventType, Errors } from '../shared/enums';
import { IProximity } from 'types';

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

  const state = object(null);
  const rect = target.getBoundingClientRect();
  const attr = target.getAttribute(`${config.schema}-proximity`);
  const distance = isNumber.test(attr) ? Number(attr) : (config.proximity as IProximity).distance;

  state.target = target;
  state.top = rect.top - distance;
  state.bottom = rect.bottom + distance;
  state.left = rect.left - distance;
  state.right = rect.right + distance;

  return state;

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

      setTimeout(() => {
        wait = false;
      }, (config.proximity as IProximity).throttle);

    } else {

      const { target } = targets[node];
      const page = store.create(getRoute(target, EventType.PROXIMITY));
      const delay = page.threshold || (config.proximity as IProximity).threshold;

      request.throttle(page.key, () => {

        if (!emit('prefetch', target, page)) return disconnect();

        return request.fetch(page).then(prefetch => {
          if (prefetch) {
            targets.splice(node, 1);
            wait = false;
            if (targets.length === 0) {
              disconnect();
              log(Errors.INFO, 'Proximity observer disconnected');
            }
          }
        });

      }, delay);

    }
  };
}

let entries: ReturnType<typeof observer>;

/**
 * Starts proximity prefetch, will parse all link nodes and
 * begin watching mouse movements.
 */
export function connect (): void {

  if (!config.proximity || observers.proximity) return;

  const targets = getTargets(selectors.proximity).map(setBounds);

  if (targets.length > 0) {

    entries = observer(targets);

    if (supportsPointerEvents) {
      addEventListener('pointermove', entries, false);
    } else {
      addEventListener('mousemove', entries, false);
    }

    observers.proximity = true;

  }

}

/**
 * Stops prefetch, will remove pointer move event listener
 */
export function disconnect (): void {

  if (!observers.proximity) return;

  if (supportsPointerEvents) {
    removeEventListener('pointermove', entries, false);
  } else {
    removeEventListener('mousemove', entries, false);
  }

  observers.proximity = false;

};
