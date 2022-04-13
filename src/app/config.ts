import { join } from './utils';
import { assign } from '../constants/native';
import * as state from './state';
import { IConfig, IIntersect, IMouseover, IProximity, Options } from 'types';

function selectors (config: IConfig) {

  const keys = 'hydrate|append|prepend|replace|progress|threshold|position|proximity|hover';
  const attr = config.schema === null ? 'data' : `data-${config.schema}`;

  state.schema.attrs = new RegExp(`^${attr}-(${keys})$`, 'i');
  state.schema.eval = `script:not([${attr}-eval=false])`;
  state.schema.hydrate = `[${attr}-hydrate]`;
  state.schema.href = `a:not([${attr}-disable]):not([href^="#"])`;
  state.schema.track = `[${attr}-track]:not([${attr}-track=false])`;
  state.schema.observe = `[${attr}-eval=true]`;

  if (typeof config.intersect === 'object') {
    state.schema.intersect = `[${attr}-intersect]:not([${attr}-intersect=false])`;
    state.schema.interhref = join(
      'a',
      `:not([${attr}-disable])`,
      `:not(a[${attr}-intersect=false])`,
      ':not([href^="#"])'
    );
  }

  if (typeof config.proximity === 'object') {
    state.schema.proximity = join(
      'a',
      `[${attr}-proximity]`,
      `:not([${attr}-proximity=false])`,
      `:not([${attr}-disable])`,
      ':not([href^="#"])'
    );
  }

  if (typeof config.hover === 'object') {

    state.schema.mouseover = config.hover.trigger === 'href' ? join(
      'a',
      `:not([${attr}-disable])`,
      `:not([${attr}-hover=false])`,
      ':not([href^="#"])'
    ) : join(
      'a',
      `[${attr}-hover]`,
      `:not([${attr}-intersect])`,
      `:not([${attr}-proximity])`,
      `:not([${attr}-disable])`,
      `:not([${attr}-hover=false])`,
      ':not([href^="#"])'
    );

  }

  return config;

}

/**
 * Initialize
 *
 * Connects store and intialized the workable
 * state management model. Connect MUST be called
 * upon Pjax initialization. This function acts
 * as a class `constructor` establishing an instance.
 */
export function initialize (options: Options = {}): IConfig {

  if (options.hover !== false) {
    assign<IMouseover, Options>(state.config.hover, options.hover);
    delete options.hover;
  }
  if (options.intersect !== false) {
    assign<IIntersect, Options>(state.config.intersect, options.intersect);
    delete options.intersect;
  }
  if (options.proximity !== false) {
    assign<IProximity, Options>(state.config.proximity, options.proximity);
    delete options.proximity;
  }
  if (options.progress !== false) {
    assign(state.config.progress, options.progress);
    delete options.progress;
  }

  // Merge Configuration
  const config = assign(state.config, options);

  // Setup Selectors
  selectors(config);

  return config;

}
