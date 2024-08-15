import spx from 'spx';

import { Alias } from '../cases/component-aliases/index.test';
import { Async } from '../cases/component-hooks/index.test';
import { Types } from '../cases/component-types/index.test';
import { Incremental } from '../cases/component-incremental/index.test';
import { Merge } from '../cases/component-merge/index.test';
import { Lifecycle } from '../cases/component-lifecycle/index.test';
import { Nesting } from '../cases/component-nesting/index.test';
import { Refs1, Refs2 } from '../cases/component-refs/index.test';

/* INTERNAL ----------------------------------- */

import { code } from './suite/resize';
import { Logger } from './suite/logger';
import { Explorer } from './suite/explorer';
// import { Refs } from './suite/refs';

spx.register(
  Alias,
  Async,
  Types,
  Incremental,
  Merge,
  Lifecycle,
  Nesting,
  Refs1,
  Refs2
);

spx(
  {
    fragments: [
      'sidebar',
      'main'
    ],
    logLevel: 1,
    hover: {
      threshold: 100,
      trigger: 'href'
    },
    progress: {
      bgColor: 'red'
    },
    components: {
      Logger,
      Explorer
      // Refs
    }
  }
)(() => {

  code();

});
