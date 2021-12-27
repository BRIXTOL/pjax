import { IPage } from './page';
import { IOptions } from './options';

/**
 * Supported
 */
export const supported: boolean;

/**
 * Connect Pjax
 */
export function connect(options: IOptions): void;

/**
 * Reload
 *
 * Reloads the current page
 */
export function reload(): Promise<IPage>;

/**
 * Cache
 */
export function cache(path?: string): IPage | { [path: string]: IPage; };

/**
 * UUID Generator
 */
export function uuid(size?: number): string;

/**
 * Flush Cache
 */
export function clear(url?: string): void;

/**
 * Visit
 */
export function visit(link: string | Element, state?: IPage): Promise<IPage>;

/**
 * Disconnect
 */
export function disconnect(): void;
