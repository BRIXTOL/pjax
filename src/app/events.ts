import { events } from './state';
import { forEach } from './utils';
/**
 * Pjax Events
 */
export type EventNames = (
  | 'connected'
  | 'prefetch'
  | 'trigger'
  | 'click'
  | 'request'
  | 'cache'
  | 'hydrate'
  | 'tracked'
  | 'render'
  | 'script'
  | 'load'
 );

/**
 * Emit Event
 *
 * Private function use for emitting events
 * which users are subscribed.
 */
export function emit (name: EventNames, ...args: any[]) {

  const data = [].slice.call(arguments, 1);

  let run = true;

  forEach(argument => {
    const cb = argument.apply(null, data);
    if (cb === false) run = false;
  }, events[name] || []);

  return run;

}

/**
 * On Event
 *
 * Exposed as public method on `pjax`
 */
export function on (name: EventNames, callback: () => void) {

  if (!(name in events)) events[name] = [];

  events[name].push(callback);

}

/**
 * Off Event
 *
 * Exposed as public method on `pjax`
 */
export function off (name: EventNames, callback: () => void) {

  const evts = events[name];
  const live = [];

  if (evts && callback) {
    let i = 0;
    const len = evts.length;
    for (; i < len; i++) if (evts[i] !== callback) live.push(evts[i]);
  }

  if (live.length) events[name] = live;
  else delete events[name];

  return this;
}
