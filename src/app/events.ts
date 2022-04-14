/* eslint-disable no-unused-vars */

import { EventNames, EmitterArguments } from 'types';
import { events } from './state';
import { forEach } from './utils';
import { parse } from './dom';

/**
 * Emit Event
 *
 * Private function use for emitting events
 * which users are subscribed.
 */
export function emit <T extends EventNames> (name: T, ...args: EmitterArguments<T>) {

  const isCache = name === 'cache';

  if (isCache) args.splice(-1, 1, parse(args[args.length - 1] as string) as any);

  let returns: boolean | string = true;

  forEach(argument => {

    const returned = argument.apply(null, args);

    if (isCache) {
      if (returned instanceof Document) {
        returns = returned.documentElement.outerHTML;
      } else {
        if (typeof returns !== 'string') returns = returned !== false;
      }
    } else {
      returns = returned !== false;
    }

  }, events[name] || []);

  return returns;

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
