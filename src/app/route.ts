import { schema } from './state';
import * as regex from '../constants/regexp';
import { IPage } from '../types/page';
import { nil, create } from '../constants/native';
import { attrjson, chunk } from './utils';
import history from 'history/browser';
import { parsePath, createPath } from 'history';
import { ILocation } from '../types/location';

/**
 * Origin
 *
 * Returns the location domain origin, eg: https://brixtol.com
 */
export const { origin } = window.location;

/**
 * Location hostname eg: https://brixtol.com
 */
export const hostname = origin.replace(regex.Protocol, nil);

/**
 * Get Attributes
 *
 * Parses link `href` attributes and assigns them to
 * configuration options.
 */
export function getAttributes ({ attributes }: Element): IPage {

  const state: IPage = create(null);

  for (const { nodeName, nodeValue } of attributes) {

    if (!schema.attrs.test(nodeName)) continue;

    const name = nodeName.slice(1 + nodeName.lastIndexOf('-'));
    const value = nodeValue.replace(/\s+/g, nil);

    if (regex.isArray.test(value)) {
      state[name] = regex.isPender.test(name)
        ? value.match(regex.ActionParams).reduce(chunk(2), [])
        : value.match(regex.ActionParams);
    } else if (regex.isPosition.test(value)) {
      state[name] = attrjson(value.match(regex.inPosition));
    } else if (regex.isBoolean.test(value)) {
      state[name] = value === 'true';
    } else if (regex.isNumber.test(value)) {
      state[name] = Number(value);
    } else {
      state[name] = value;
    }

  }

  return state;

}

/**
 * Get Key (pathname)
 *
 * Returns the pathname cache key URL
 * reference which is used as property id
 * in the cache store.
 */
export function getKey (link?: string): string {

  // 47 is unicode value for '/', eg: '/path'
  if (link.charCodeAt(0) === 47 && link.charCodeAt(1) !== 47) {

    // Strips any hash references from url
    const hash = link.indexOf('#');
    return hash !== -1 ? link.slice(0, hash) : link;
  }

  // 63 is unicode value for '?', eg: '?param'
  if (link.charCodeAt(0) === 63) return history.location.pathname + link;

  // Handle url references, eg: 'https://' or '//'
  const url = link.match(regex.Pathname);

  if (url !== null) {

    // Invalid hostname, eg: github.com !== brixtol.com
    if (hostname !== url[1]) return null;

    // Valid hostname, pointing to index, eg: https://brixtol.com
    if (url[2] === undefined) return '/';

    return url[2];

  }

  // Unable to process, pass null
  return null;

};

/**
 * Get Locationæ™
 *
 * Parses link and returns an ILocation.
 */
export function getLocation (path: string): ILocation {

  const state: ILocation = create(null);
  const { hash, pathname, search } = parsePath(path);

  state.origin = origin;
  state.hostname = hostname;
  state.pathname = pathname;
  state.search = search;
  state.hash = hash;
  state.lastpath = createPath(history.location);

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
export function getRoute (link?: Element | string, type?: string): IPage {

  const state: IPage = link instanceof Element
    ? getAttributes(link)
    : create(null);

  const path = typeof link === 'string'
    ? link
    : typeof link === 'undefined'
      ? createPath(history.location)
      : link.getAttribute('href');

  state.key = getKey(path);
  state.location = getLocation(state.key);

  state.type = typeof type === 'undefined'
    ? path === state.location.lastpath
      ? 'initial'
      : type
    : 'visit';

  return state;

};
