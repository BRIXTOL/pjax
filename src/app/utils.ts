import { pages, snaps } from './state';
import * as regex from '../constants/regexp';
import { create, toArray, nil } from '../constants/native';

/**
 * Join Strings
 */
export function join (...strings: string[]): string {

  return strings.join(nil);

}

/**
 * Array Chunk function
 */
export function chunk (size: number = 2): (acc: any[], value: string) => any[] {

  return (acc, value) => {

    const length: number = acc.length;
    const chunks = (length < 1) || (acc[length - 1].length === size);

    return (chunks ? acc.push([ value ]) : acc[length - 1].push(value)) && acc;

  };
}

/**
 * Constructs a JSON object from HTML `data-pjax-*` attributes.
 * Attributes are passed in as array items
 *
 * @example
 *
 * // Attribute values are seperated by whitespace
 * // For example, a HTML attribute would look like:
 * <data-pjax-prop="string:foo number:200">
 *
 * // Attribute values are split into an Array
 * // The array is passed to this reducer function
 * ["string", "foo", "number", "200"]
 *
 * // This reducer function will return:
 * { string: 'foo', number: 200 }
 *
 */
export function attrjson (attributes: any[]): { [key: string]: string | number } {

  const state = create(null);

  forEach((current: string, index: number, source: string[]) => {
    const prop = (source.length - 1) >= index ? (index - 1) : index;
    if (index % 2) state[source[prop]] = regex.isNumber.test(current) ? Number(current) : current;
  }, attributes);

  return state;

};

/**
 * A setTimeout as promise that resolves after `x` milliseconds.
 */
export function delay (ms: number) {

  return new Promise(resolve => setTimeout(() => resolve('DELAY'), ms));

}

/**
 * Locted the closest link when click bubbles.
 */
export function getLink (target: EventTarget | MouseEvent, selector: string): HTMLLinkElement | false {

  if (target instanceof Element) {
    const element = target.closest(selector);
    if (element && element.tagName === 'A') return element as HTMLLinkElement;
  }

  return false;

}

/**
 * Returns the byte size of a string value
 */
export function byteSize (string: string): number {

  return new Blob([ string ]).size;

}

/**
 * Clear Object properties
 */
export function clearObject (object: object): boolean {

  for (const prop in object) delete object[prop];

  return true;

}

/**
 * Link is not cached and can be fetched
 */
export function canFetch (target: Element): boolean {

  if (target.nodeName !== 'A') return false;

  const key = target.getAttribute('href');
  const has = (key in pages && 'snapshot' in pages[key]) ? pages[key].snapshot in snaps : false;

  return has === false;
}

/**
 * Returns a list of link elements to be prefetched. Filters out
 * any links which exist in cache to prevent extrenous transit.
 */
export function getNodeTargets (selector: string, hrefs: string): Element[] {

  const targets = document.body.querySelectorAll(selector);
  const nodes = toArray(targets).flatMap((node) => {
    return node.nodeName !== 'A'
      ? toArray(node.querySelectorAll(hrefs)).filter(canFetch)
      : canFetch(node) ? node : [];
  });

  return nodes;
}

/**
 * Returns a list of link elements to be prefetched. Filters out
 * any links which exist in cache to prevent extrenous transit.
 */
export function getTargets (selector: string): Element[] {

  const targets = document.body.querySelectorAll(selector);

  return toArray(targets).filter(canFetch);

}

/**
 * Converts byte size to killobyte, megabyre,
 * gigabyte or terrabyte
 */
export function byteConvert (bytes: number): string {

  if (bytes === 0) return '0 B';

  const size = parseInt(`${Math.floor(Math.log(bytes) / Math.log(1024))}`, 10);
  const unit = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

  return size === 0
    ? `${bytes} ${unit[size]}`
    : `${(bytes / 1024 ** size).toFixed(1)} ${unit[size]}`;
}

/**
 * Each iterator helper function. Provides a util function
 * for loop iterations
 */
export function forEach (
  fn: (item: Element | any, index?: number, array?: any) => any,
  array?: any
): (
  array: any
) => any {

  if (arguments.length === 1) return (array: any) => forEach(fn, array);

  const len = array.length;

  if (len === 0) return;

  let i = 0;

  while (i < len) {
    fn(array[i], i, array);
    i++;
  }

}

/**
 * Get Element attributes
 */
export function getElementAttrs (
  { attributes }: Element,
  {
    exclude = [],
    include = []
  }: {
    exclude?: string[],
    include?: Array<[
      name: string,
      value: string
    ]>
  }
): Array<[
  name: string,
  value: string
]> {

  forEach(({ name = null, value = null }) => {
    if (name && value && !exclude.includes(name)) include.push([ name, value ]);
  }, toArray(attributes));

  return include;
}

/**
 * Returns a list of link elements to be prefetched. Filters out
 * any links which exist in cache to prevent extrenous transit.
 */
export function emptyObject <T> (object: T): boolean {

  const items = Object.getOwnPropertyNames(object);

  return items.length === 0
    ? true
    : items.every(prop => delete object[prop] === true);

}
