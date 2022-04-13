import { IPage } from './page';
import { IOptions } from './options';
import { EventNames, LifecycleEvent } from './events';

/**
 * Supported
 */
export const supported: boolean;

/**
 * Connect Pjax
 */
export function connect(options?: IOptions): void;

/**
 * Reload
 *
 * Reloads the current page
 */
export function reload(): Promise<IPage>;

/**
 * Event Listener
 *
 * Listens for events dispatched
 */
export function on<T extends EventNames>(event: T, callback: LifecycleEvent<T>): void

/**
 * Cache
 *
 * Returns the session cache
 */
export function cache(path?: string): IPage | { [path: string]: IPage; };

/**
 * Hydrate Trigger
 *
 * Programmatic hydrate execution.
 */
export function hydrate(url: string, elements: string[]): Promise<IPage>

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
