
import { toArray } from './native';
import { getKey, validKey } from '../app/route';
import { has } from '../app/store';

/**
 * Locted the closest link when click bubbles.
 */
export function getLink (target: EventTarget | MouseEvent, selector: string): HTMLLinkElement | false {

  if (!(target instanceof Element)) return false;

  const element = target.closest(selector);

  return (element && element.tagName === 'A')
    ? element as HTMLLinkElement
    : false;

};

/**
 * Link is not cached and can be fetched
 */
export function canFetch (target: Element): boolean {

  if (target.nodeName !== 'A') return false;

  const href = (target as HTMLLinkElement).href;

  if (!validKey(href)) return false;

  return !has(getKey(href));

};

/**
 * Returns a list of link elements to be prefetched. Filters out
 * any links which exist in cache to prevent extrenous transit.
 */
export function getNodeTargets (selector: string, hrefs: string): Element[] {

  return toArray(document.body.querySelectorAll(selector)).flatMap((node) => {
    return node.nodeName !== 'A'
      ? toArray(node.querySelectorAll(hrefs)).filter(canFetch)
      : canFetch(node) ? node : [];
  });

};

/**
 * Returns a list of link elements to be prefetched. Filters out
 * any links which exist in cache to prevent extrenous transit.
 */
export const getTargets = (selector: string): Element[] => {

  return toArray(document.body.querySelectorAll(selector)).filter(canFetch);

};
