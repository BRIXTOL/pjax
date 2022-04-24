import { IConfig, IPage, IObservers, ISelectors, IMemory } from 'types';
import { object } from '../shared/native';
import { defaults } from './defaults';

/**
 * Configuration
 *
 * Initialization settings applied upon Pjax connection.
 * These are instance options, informing upon how the
 * pjax instance should run. The options defined here are
 * the defaults applied at runtime.
 */
export const config: IConfig = defaults();

/**
 * Observers
 *
 * Determines the connection of various observers
 * and logic required for the Pjax instance.
 *
 * - History
 * - Href
 * - Hover
 * - Intersect
 * - Scroll
 * - Proximity
 */
export const observers: IObservers = object(null);

/**
 * Memory
 *
 * This object reference which holds the storage memory
 * record throughout the pjax session.
 */
export const memory: IMemory = object(null);

/**
 * Selectors
 *
 * The object holds a query selector list of string
 * values and expressions that apply the schema reference.
 */
export const selectors: ISelectors = object(null);

/**
 * Pages
 *
 * Per-page state models. Each page uses a reference
 * configuration model. The objects in this store are
 * also available to the history API.
 */
export const pages: { [url: string]: IPage } = object(null);

/**
 * Snapshots
 *
 * This object holds documents responses of every page.
 * Each document is stored in string type. The key values
 * are unique ids generated using nanoid.
 */
export const snapshots:{ [id: string]: string } = object(null);

/**
 * Tracked Elements
 *
 * Keeps a reference of tracked nodes between renders
 * and navigations to prevent extra appends from occuring.
 */
export const tracked: Set<string> = new Set();
