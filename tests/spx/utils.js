export const object = Object.create;

export const CacheValue = /^(reset|clear)$/i;
export const Protocol = /(?:https?:)?\/\/(?:www\.)?/;
export const Pathname = /(?:https?:)?\/\/(?:www\.)?([^/]*?)?([/?][^;]*?)?(#[^#]*?)?$/i;
export const FormInputs = /^(input|textarea|select|datalist|button|output)$/i;
export const isReady = /^(interactive|complete)$/i;
export const isPender = /\b(?:append|prepend)/;
export const MimeType = /^(?:application|text)\/(?:x-)?(?:ecma|java)script|text\/javascript$/;
export const isBoolean = /^\b(?:true|false)$/i;
export const isNumber = /^[+-]?\d*\.?\d+$/;
export const Whitespace = /\s+/g;
export const isAction = /\b(?:append|prepend|hydrate|ignore)/g;
export const isCache = /\b(?:false|true|reset|restore)\b/;
export const isPrefetch = /\b(?:intersect|hover|proximity)\b/;
export const isNumberOrBoolean = /\b(?:progress|proximity)/;
export const ActionParams = /\[?[^,'"[\]()\s]+\]?/g;
export const isArray = /\(?\[(['"]?.*['"]?,?)\]\)?/;
export const isPosition = /[xy]:[0-9.]+/;
export const inPosition = /[xy]|\d*\.?\d+/g;

export function chunk (size = 2) {

  return (acc, value) => {

    const length = acc.length;
    const chunks = (
      (
        length < 1
      ) || (
        acc[length - 1].length === size
      )
    ) ? acc.push([ value ]) : acc[length - 1].push(value);

    return chunks && acc;

  };
}

export function forEach (fn, array) {

  if (arguments.length === 1) return (array) => forEach(fn, array);

  const len = array.length;

  if (len === 0) return;

  let i = 0;

  while (i < len) {
    fn(array[i], i, array);
    i++;
  }

}
