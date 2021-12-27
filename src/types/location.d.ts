import { PartialPath } from 'history';

/**
 * The URL location object
 */
export interface ILocation extends PartialPath {
  /**
   * The URL origin name
   *
   * @example
   * 'https://website.com'
   */
  origin?: string;
  /**
   * The URL Hostname
   *
   * @example
   * 'website.com'
   */
  hostname?: string;

  /**
   * The URL Pathname
   *
   * @example
   * '/pathname' OR '/pathname/foo/bar'
   */
  pathname?: string;

  /**
   * The URL search params
   *
   * @example
   * '?param=foo&bar=baz'
   */
  search?: string;

  /**
   * The URL Hash
   *
   * @example
   * '#foo'
   */
  hash?: string;

  /**
   * The previous page path URL, this is also the cache identifier
   *
   * @example
   * '/pathname' OR '/pathname?foo=bar'
   */
  lastpath?: string;
}
