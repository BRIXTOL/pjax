import { History } from 'types';

/**
 * History API `window.history`
 */
export const history = window.history as History;

/**
 * The location origin, eg: `https://brixtol.com`
 */
export const origin = window.location.origin;

/**
 * Cached `Object.getOwnPropertyNames`
 */
export const props = Object.getOwnPropertyNames;

/**
 * Cached `Object.assign`
 */
export const assign = Object.assign;

/**
  * Cached `Object.create`
  */
export const object = Object.create;

/**
 * Cached `Array.isArray`
 */
export const isArray = Array.isArray;

/**
 * Cached `Array.from`
 */
export const toArray = Array.from;

/**
 * Empty string value
 */
export const nil = '';
