import { Errors } from './enums';

/**
 * Type Error
 *
 * Error wanrning handler
 */
export function log (error: Errors, message: string) {

  if (error === Errors.INFO) {

    console.info('SPX: ' + message);

  } else if (error === Errors.WARN) {

    console.warn('SPX: ' + message);

  } else {

    console.error('SPX: ' + message);

    try {

      if (error === Errors.TYPE) {
        throw new TypeError(message);
      } else {
        throw new Error(message);
      }

    } catch (e) {}

  }

}

/**
 * Used to validate the null prototype objects used in the module.
 */
export function hasProp <T extends object> (object: T, property: keyof T): boolean {

  return property in object;

}

/**
 * Creates a UUID string used for snapshot
 * record references.
 */
export function uuid () {

  return Math.random().toString(36).slice(2);
}

/**
 * Array Chunk function
 */
export function chunk (size: number = 2): (acc: any[], value: string) => any[] {

  return (acc, value) => {

    const length: number = acc.length;
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

/**
 * Converts byte size to killobyte, megabyre,
 * gigabyte or terrabyte
 */
export function size (bytes: number): string {

  const kb = 1024;
  const mb = 1048576;
  const gb = 1073741824;

  if (bytes < kb) return bytes + ' B';
  else if (bytes < mb) return (bytes / kb).toFixed(1) + ' KB';
  else if (bytes < gb) return (bytes / mb).toFixed(1) + ' MB';
  else return (bytes / gb).toFixed(1) + ' GB';

};

/**
 * Synchronous forEach iterator wrapper. Provides curried support.
 * It's using the `for` iterator which is best for records under
 * 1000 (which is the standard for this library).
 */
export function forEach <T> (callback: (
  item: T,
  index?: number,
  array?: Array<T>
) => void, array?: Array<T>) {

  // curried expression
  if (arguments.length === 1) return (array: Array<T>) => forEach(callback, array);

  const len = array.length;

  // Ensure we can iterate the list
  if (len === 0) return;

  // Loop over the items in the array
  for (let i = 0; i < len; i++) callback(array[i], i, array);

}

/**
 * Returns a list of link elements to be prefetched. Filters out
 * any links which exist in cache to prevent extrenous transit.
 */
export function empty <T> (object: T) {

  for (const prop in object) delete object[prop];

};
