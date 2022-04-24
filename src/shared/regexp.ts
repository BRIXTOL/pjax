/**
 * HTTP or HTTPS or //
 *
 * The Protocol portion of a url.
 */
export const HTTP = /^(?:https?:)?\/\//;

/**
 * Cache Value
 *
 * Used to cahce values
 */
export const CacheValue: RegExp = /^(reset|clear)$/i;

/**
 * URL Protocol
 *
 * @see
 * https://regex101.com/r/oC1gn9/1
 */
export const Protocol: RegExp = /(?:https?:)?\/\/(?:www\.)?/;

/**
 * URL Pathname
 *
 * Used to match first pathname from a URL.
 *
 * Capture Group Indexes
 *
 * 1. Hostname, eg: brixtol.com
 * 2. Pathname, eg: /collections/product?variant=xxx
 * 3. Hash, eg: #some-hash
 *
 * @see
 * https://regex101.com/r/57UCeF/1
 */
export const Pathname: RegExp = /(?:https?:)?\/\/(?:www\.)?([^/]*?)?([/?][^;]*?)?(#[^#]*?)?$/i;

/**
 * Form Inputs
 *
 * Used to match Form Input elements
 */
export const FormInputs: RegExp = /^(input|textarea|select|datalist|button|output)$/i;

/**
 * Ready State
 *
 * Ready State Match
 */
export const isReady: RegExp = /^(interactive|complete)$/i;

/**
 * Append or Prepend attribute value
 *
 * Used to test value for append or prepend, array within array
 *
 * @see
 * https://regex101.com/r/8d7Swb/1
 *
 */
export const isPender: RegExp = /\b(?:append|prepend)/;

/**
 * JavaScript Mime Type
 *
 * Captures `<script>` tag mime types
 */
export const MimeType: RegExp = /^(?:application|text)\/(?:x-)?(?:ecma|java)script|text\/javascript$/;

/**
 * Boolean Attribute value
 *
 * Used to Match 'true' or 'false' attribute
 *
 * @see
 * https://regex101.com/r/gIgDWL/1
 */
export const isBoolean: RegExp = /^\b(?:true|false)$/i;

/**
 * Matches decimal number
 *
 * Used to Match number, respected negative numbers
 *
 * @see
 * https://regex101.com/r/QDIAN0/1
 */
export const isNumber: RegExp = /^[+-]?\d*\.?\d+$/;

/**
 * Matches whitespaces (greedy)
 *
 * Used to Match whitspaces
 */
export const Whitespace: RegExp = /\s+/g;

/**
 * Attribute Action Caller
 *
 * Used to match the event caller for attribute actions
 */
export const isAction: RegExp = /\b(?:append|prepend|hydrate|ignore)/g;

/**
 * Cache Attribute
 *
 * Used to match and validate a cache attribute config
 */
export const isCache: RegExp = /\b(?:false|true|reset|restore)\b/;

/**
 * Threshold Attribute Value
 *
 * Used to match threshold JSON attributes
 */
export const isPrefetch: RegExp = /\b(?:intersect|hover|proximity)\b/;

/**
 * Number or Boolean
 *
 * Used to match progress or proximity attribute values
 *
 */
export const isNumberOrBoolean: RegExp = /\b(?:progress|proximity)/;

/**
 * Attribute Parameter Value
 *
 * Used to match a class event caller target attributes
 */
export const ActionParams: RegExp = /\[?[^,'"[\]()\s]+\]?/g;

/**
 * Array Value
 *
 * Used to test value for a string array attribute value, like data-spx-replace.
 *
 * @see
 * https://regex101.com/r/bIQefA/1
 *
 */
export const isArray: RegExp = /\(?\[(['"]?.*['"]?,?)\]\)?/;

/**
 * Test Position Attributes
 *
 * Tests attribute values for a position config
 *
 * @see
 * https://regex101.com/r/DG2LI1/1
 *
 */
export const isPosition: RegExp = /[xy]:[0-9.]+/;

/**
 * Mached Position Attributes
 *
 * Used to match `x:0` and `y:0` JSON space separated attributes
 */
export const inPosition: RegExp = /[xy]|\d*\.?\d+/g;
