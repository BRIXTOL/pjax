import { selectors } from './session';
import * as regex from '../shared/regexp';
import { IPage, ILocation } from 'types';
import { nil, object, origin } from '../shared/native';
import { forEach, chunk } from '../shared/utils';
import { EventType } from '../shared/enums';

/**
 * Location hostname eg: brixtol.com
 */
export const hostname = origin.replace(regex.Protocol, nil);

/**
 * Constructs a JSON object from HTML `data-spx-*` attributes.
 * Attributes are passed in as array items
 *
 * @example
 *
 * // Attribute values are seperated by whitespace
 * // For example, a HTML attribute would look like:
 * <data-spx-prop="string:foo number:200">
 *
 * // Attribute values are split into an Array
 * // The array is passed to this reducer function
 * ["string", "foo", "number", "200"]
 *
 * // This reducer function will return:
 * { string: 'foo', number: 200 }
 *
 */
function parseAttribute (attributes: any[]): { [key: string]: string | number } {

  const state = object(null);

  forEach((current: string, index: number, source: string[]) => {
    const prop = (source.length - 1) >= index ? (index - 1) : index;
    if (index % 2) state[source[prop]] = regex.isNumber.test(current) ? Number(current) : current;
  }, attributes);

  return state;

};

/**
 * Get Attributes
 *
 * Parses `href` or `form` attributes and assigns them to
 * configuration options. This function contructs the initial
 * page state model.
 */
export function getAttributes (element: Element, page?: IPage): IPage {

  const state: IPage = page || object(null);

  for (const { nodeName, nodeValue } of element.attributes) {

    if (!selectors.attrs.test(nodeName)) continue;

    // KEY REFERENCE
    if (nodeName === 'href') {

      state.rev = location.pathname + location.search;

      if (!page) {
        state.location = getLocation(nodeValue);
        state.key = state.location.pathname + state.location.search;
      }

      continue;
    }

    const name = nodeName.slice(1 + nodeName.lastIndexOf('-'));
    const value = nodeValue.replace(regex.Whitespace, nil);

    if (regex.isArray.test(value)) {
      state[name] = regex.isPender.test(name)
        ? value.match(regex.ActionParams).reduce(chunk(2), [])
        : value.match(regex.ActionParams);
    } else if (regex.isPosition.test(value)) {
      state[name] = parseAttribute(value.match(regex.inPosition));
    } else if (regex.isBoolean.test(value)) {
      if (!regex.isPrefetch.test(nodeName)) state[name] = value === 'true';
    } else if (regex.isNumber.test(value)) {
      state[name] = Number(value);
    } else {
      state[name] = value;
    }

  }

  return state;

}

/**
 * Parse Path
 *
 * Builds an object model of the provided
 * path string.
 */
function parsePath (path: string) {

  const state: ILocation = object(null);

  const hash = path.indexOf('#');

  if (hash >= 0) {
    state.hash = path.slice(hash);
    path = path.slice(0, hash);
  } else {
    state.hash = nil;
  }

  const params = path.indexOf('?');

  if (params >= 0) {
    state.search = path.slice(params);
    path = path.slice(0, params);
  } else {
    state.search = nil;
  }

  state.pathname = path;

  return state;
}

function getPath (url: string, proto: number) {

  const path = url.indexOf('/', proto);

  if (path > proto) {
    const hash = url.indexOf('#', path);
    return hash < 0 ? url.slice(path) : url.slice(path, hash);
  }

  const param = url.indexOf('?', proto);

  if (param > proto) {
    const hash = url.indexOf('#', param);
    return hash < 0 ? url.slice(param) : url.slice(param, hash);
  }

  return url.length - proto === hostname.length ? '/' : null;

}

/**
 * Parse Origin
 *
 * Despite the name, this function will behave
 * identical to `parsePath` with the exception
 * that the `origin` value is validates against.
 *
 * > This is used when a URL was supplied.
 */
function parseOrigin (url: string) {

  const path = url.startsWith('www.') ? url.slice(4) : url;
  const name = path.indexOf('/');

  if (name >= 0) {
    const key = path.slice(name);
    if (path.slice(0, name) === hostname) return key.length ? parsePath(key) : parsePath('/');
  } else {

    const char = path.search(/[?#]/);

    if (char >= 0) {
      if (path.slice(0, char) === hostname) return parsePath('/' + path.slice(char));
    } else {
      if (path === hostname) return parsePath('/');
    }
  }

  return null;

}

/**
 * Has Origin
 *
 * Checks to see if the URL contains an origin. We
 * use integer return values to inform the origin type.
 * If a value of `0` returned there is no origin in the URL.
 *
 * 1. http or https
 * 2. //
 * 3. www.
 */
function hasOrigin (url: string): number {

  if (url.startsWith('http')) return 1;
  if (url.startsWith('//')) return 2;
  if (url.startsWith('www.')) return 3;

  return 0;

}

/**
 * Valid Key
 *
 * Validates URL's contained in a document and returns
 * a boolean informing if the the path is valid or not.
 */
export function validKey (url: string) {

  if (typeof url !== 'string' || url.length === 0) return false;

  if (url.charCodeAt(0) === 47) {
    if (url.charCodeAt(1) !== 47) return true;
    if (url.startsWith('www.', 2)) return url.startsWith(hostname, 6);
    return url.startsWith(hostname, 2);
  }

  if (url.charCodeAt(0) === 63) return true;
  if (url.startsWith('www.')) return url.startsWith(hostname, 4);
  if (url.startsWith('http')) {
    const start = url.indexOf('/', 4) + 2;
    return url.startsWith('www.', start)
      ? url.startsWith(hostname, start + 4)
      : url.startsWith(hostname, start);
  }

}

/**
 * Parse Key
 *
 * Builds an object reference from a string path
 * value and returns a parsed record of the value.
 */
export function parseKey (url: string): ILocation {

  // 47 is unicode for '/'
  if (url.charCodeAt(0) === 47) {

    return url.charCodeAt(1) !== 47
      ? parsePath(url) // Character is not '/' we have a pathname
      : parseOrigin(url.slice(2)); // Strips the double slash //
  }

  // 63 is unicode for '?' (eg: ?foo=bar)
  if (url.charCodeAt(0) === 63) return parsePath((location.pathname + url));

  // Path starts with protocol
  if (url.startsWith('https:') || url.startsWith('http:')) {
    return parseOrigin(url.slice(url.indexOf('/', 4) + 2)); // Strips the protocol
  }

  if (url.startsWith('www.')) return parseOrigin(url);

  return null;

}

/**
 * Get Key (pathname)
 *
 * Returns the pathname cache key URL
 * reference which is used as property id
 * in the cache store.
 */
export function getKey (link: string | ILocation): string {

  if (typeof link === 'object') return link.pathname + link.search;

  const has = hasOrigin(link);

  if (has === 1) {
    const proto = link.charCodeAt(4) === 115 ? 8 : 7;
    const www = link.startsWith('www.', proto) ? (proto + 4) : proto;
    return link.startsWith(hostname, www) ? getPath(link, www) : null;
  }

  if (has === 2) {
    const www = link.startsWith('www.', 2) ? 6 : 2;
    return link.startsWith(hostname, www) ? getPath(link, www) : null;
  }

  if (has === 3) return link.startsWith(hostname, 4) ? getPath(link, 4) : null;

  return link.startsWith(hostname, 0) ? getPath(link, 0) : null;

};

/**
 * Get Location
 *
 * Parses link and returns an ILocation.
 */
export function getLocation (path: string): ILocation {

  const state = parseKey(path);

  state.origin = origin;
  state.hostname = hostname;

  return state;

};

/**
 * Get Route
 *
 * Parses link and returns page state. When `link`
 * is a HTML Element (ie: `<a href=""></a>`) then
 * we parse the node and assign any attributes.
 *
 * This function is triggered for every visit request
 * or action which infers navigations, ie: mouseover.
 */
export function getRoute (link: Element | string | EventType, type?: EventType): IPage {

  // PASSED IN ELEMENT
  // Route state will be generated using node attributes
  if (link instanceof Element) {
    const state = getAttributes(link);
    state.type = type || EventType.VISIT;
    return state;
  }

  const state: IPage = object(null);
  state.fwd = null;
  state.rev = location.pathname + location.search;
  state.location = getLocation(typeof link === 'string' ? link : state.rev);
  state.key = getKey(state.location);
  state.type = type || EventType.VISIT;

  return state;

};
