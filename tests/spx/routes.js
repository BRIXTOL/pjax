import { object, forEach, chunk } from './utils.js';
import * as regex from './utils.js';

/* -------------------------------------------- */
/* CONSTANTS                                    */
/* -------------------------------------------- */

const hostname = 'brixtol.com';
const nil = '';
const location = { pathname: '/foo/bar', search: '' };
const origin = 'https://brixtol.com';
const selectors = {
  attrs: /^href|data-spx-(hydrate|append|prepend|replace|progress|threshold|position|proximity|hover)$/i
};

/* -------------------------------------------- */
/* FUNCTIONS                                    */
/* -------------------------------------------- */

export function parsePath (path) {

  const state = object(null);
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

function getLocation (path) {

  const state = parseKey(path);

  state.origin = origin;
  state.hostname = hostname;

  return state;

};

function parseAttribute (attributes) {

  const state = object(null);

  forEach((current, index, source) => {
    const prop = (source.length - 1) >= index ? (index - 1) : index;
    if (index % 2) state[source[prop]] = regex.isNumber.test(current) ? Number(current) : current;
  }, attributes);

  return state;

};

export function getAttributes (element) {

  const state = object(null);

  for (const { nodeName, nodeValue } of element.attributes) {

    if (!selectors.attrs.test(nodeName)) continue;

    // KEY REFERENCE
    if (nodeName === 'href') {
      state.location = getLocation(nodeValue);
      state.key = state.location.pathname + state.location.search;
      state.rev = location.pathname + location.search;
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

export function parseOrigin (url) {

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

export function validKey (url) {

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

export function parseKey (url) {

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
