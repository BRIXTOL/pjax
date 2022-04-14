import { join } from './utils';
import { assign } from '../constants/native';
import * as state from './state';
import { IConfig, IIntersect, IMouseover, IProximity, Options } from 'types';

function selectors (config: IConfig) {

  const keys = 'hydrate|append|prepend|replace|progress|threshold|position|proximity|hover|history';

  state.schema.attrs = new RegExp(`^${config.schema}-(${keys})$`, 'i');
  state.schema.hydrate = `[${config.schema}-hydrate]`;
  state.schema.href = `a:not([${config.schema}-disable]):not([href^="#"])`;
  state.schema.track = `[${config.schema}-track]:not([${config.schema}-track=false])`;

  state.schema.scripts = `script:not([${config.schema}-eval=false])`;
  state.schema.styles = `style:not([${config.schema}-eval=false])`;
  state.schema.stylelink = `link[rel=stylesheet]:not([${config.schema}-eval=false])`;

  if (typeof config.intersect === 'object') {
    state.schema.intersect = `[${config.schema}-intersect]:not([${config.schema}-intersect=false])`;
    state.schema.interhref = join(
      'a',
      `:not([${config.schema}-disable])`,
      `:not(a[${config.schema}-intersect=false])`,
      ':not([href^="#"])'
    );
  }

  if (typeof config.proximity === 'object') {
    state.schema.proximity = join(
      'a',
      `[${config.schema}-proximity]`,
      `:not([${config.schema}-proximity=false])`,
      `:not([${config.schema}-disable])`,
      ':not([href^="#"])'
    );
  }

  if (typeof config.hover === 'object') {

    state.schema.mouseover = config.hover.trigger === 'href' ? join(
      'a',
      `:not([${config.schema}-disable])`,
      `:not([${config.schema}-hover=false])`,
      `:not([${config.schema}-intersect])`,
      `:not([${config.schema}-proximity])`,
      ':not([href^="#"])'
    ) : join(
      'a',
      `[${config.schema}-hover]`,
      `:not([${config.schema}-intersect])`,
      `:not([${config.schema}-proximity])`,
      `:not([${config.schema}-disable])`,
      `:not([${config.schema}-hover=false])`,
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
  config.schema = config.schema === null ? 'data' : `data-${config.schema}`;

  // Setup Selectors
  selectors(config);

  return config;

}
