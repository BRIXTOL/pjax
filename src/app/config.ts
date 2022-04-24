/* eslint-disable no-unused-vars */

import { Attributes } from '../shared/enums';
import { assign } from '../shared/native';
import { config, selectors, memory } from './session';
import { IConfig, IOptions } from 'types';
import { hasProp } from '../shared/utils';

/**
 * Initialize
 *
 * Connects store and intialized the workable
 * state management model. Connect MUST be called
 * upon SPX initialization. This function acts
 * as a class `constructor` establishing an instance.
 */
export function configure (options: IOptions = {}) {

  if (hasProp(options, 'hover')) {
    if (typeof options.hover !== 'boolean') assign(config.hover, options.hover);
    else if (options.hover === false) config.hover = options.hover;
    delete options.hover;
  }

  if (hasProp(options, 'intersect')) {
    if (typeof options.intersect !== 'boolean') assign(config.intersect, options.intersect);
    else if (options.intersect === false) config.intersect = options.intersect;
    delete options.intersect;
  }

  if (hasProp(options, 'proximity')) {
    if (typeof options.proximity !== 'boolean') assign(config.proximity, options.proximity);
    else if (options.proximity === false) config.proximity = options.proximity;
    delete options.proximity;
  }

  if (hasProp(options, 'progress')) {
    if (typeof options.progress !== 'boolean') assign(config.progress, options.progress);
    else if (options.progress === false) config.progress = options.progress;
    delete options.progress;
  }

  if (hasProp(options, 'session')) {
    if (options.session === 'persist') {

      const record = localStorage.getItem('spx');

      if (record === null) {
        config.session = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem('spx', config.session);
      } else {
        config.session = record;
      }
    }

    delete options.session;
  }

  // Name of attribute selector
  const n = config.schema === null ? 'data' : `data-${config.schema}`;

  // Href Omitter
  const h = `:not([${n}-disable]):not([href^="#"])`;

  // Selectors
  selectors.attrs = new RegExp('^href|' + n + '-(' + Attributes.NAMES + ')$', 'i');
  selectors.hydrate = `[${n}-hydrate]`;
  selectors.track = `[${n}-track]:not([${n}-track=false])`;
  selectors.script = `script:not([${n}-eval=false])`;
  selectors.style = `style:not([${n}-eval=false])`;
  selectors.styleLink = `link[rel=stylesheet]:not([${n}-eval=false])`;
  selectors.href = `a${h}`;

  if (config.intersect !== false) {
    selectors.intersect = `[${n}-intersect]:not([${n}-intersect=false])`;
    selectors.interHref = `a${h}:not([${n}-intersect=false])`;
  }

  if (config.proximity !== false) {
    selectors.proximity = `a[${n}-proximity]${h}:not([${n}-proximity=false])`;
  }

  if (config.hover !== false) {
    selectors.hover = config.hover.trigger === 'href'
      ? `a${h}:not([${n}-hover=false]):not([${n}-intersect]):not([${n}-proximity])`
      : `a[${n}-hover]${h}:not([${n}-hover=false]):not([${n}-intersect]):not([${n}-proximity])`;
  }

  assign<IConfig, IOptions>(config, options);

  memory.bytes = 0;
  memory.limit = config.limit;
  memory.visits = 0;

}
