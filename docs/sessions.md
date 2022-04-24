# Sessions

A SPX navigation sessions will begin immediately after a connection was initialized via `spx.connect()` and ends when a browser refresh is executed or url origin changes occurs. You can access, view or modify the session store using the `spx.session()` method.

> The `spx.session()` method references a subset of null prototypical objects.

## Model

```typescript
interface ISession {
  readonly selectors: object;
  readonly pages: { [key: string]: IPage };
  readonly snapshots: { [uuid: string]: string };
  readonly memory: {
    size: string;
    bytes: number;
    visits: number;
  };
  options: IOptions;
  observers: {
    history: boolean;
    hover: boolean;
    hrefs: boolean;
    intersect: boolean;
    proximity: boolean;
    scroll: boolean;
  };
}
```

#### `options`

The merged default and custom configuration [options](#options) provided on connection via `spx.connect()`.

#### `observers`

The connected observers being used in the session.

#### `schema`

A **readonly** reference object list of selectors used by the module for internal operations.

#### `pages`

A **readonly** key > value store of pages visited. The object properties (keys) in this store use a pathname + parameter combinator sequence which map to page states. See [state](#state) for more information.

#### `snapshots`

A **readonly** key > value store of snapshots. Snapshots hold the DOM string responses of visited pages. The object properties (keys) in this store use the `UUID` values in page [state](#states). S

#### `tracked`

A **readonly** `Set` of tracked nodes that have been rendered to the document.

# State

State represents per-page configuration. This store is immutable and created for every unique url `/path` or `/pathname?query=param` location that has been encountered throughout the session. The state of each page is stored in memory and also written to the browsers history stack so it can be retrieved in subsequent visits.

State modifications can be carried out using attributes, methods or from within lifecycle events that support it. When using the `spx.visit()` method you can apply state modification in the `options` parameter and changes will be merged before a visit begins. You should avoid modifying state outside of the available methods, treat state as **read only** and architect your application to prevent direct augmentation.

> State saved to history stack is stored with the `config` object omitted.

## Model

```typescript
interface IPage {
  uuid: string;
  key: string;
  rev: string;
  title: string;
  type: number;
  cache: boolean | number;
  history: boolean | string;
  threshold?: number;
  proximity?: number;
  hydrate?: string[];
  replace?: string[];
  append?: [from: string, to: string][];
  prepend?: [from: string, to: string][];
  position: {
    y: number;
    x: number;
  };
  location: {
    origin: string;
    hostname: string;
    pathname: string;
    search?: string;
    hash?: string;
  };
}
```

#### `uuid`

A UUID reference to the page snapshot HTML Document element.

#### `key`

A URL pathname + parameter combination key reference (this value excludes `#hashes`).

#### `rev`

A previous pathname + parameter combination key reference, ie: the previous page

#### `title`

The document title, ie: the text content contained in `<title></title>` tags.

#### `type`

An enumerable number reference that informs upon how this store was created.

#### `position{}`

Scroll position of the next navigation. The `y` - Equivalent to `scrollTop` and the `x` is equivalent to `scrollLeft`.

#### `location{}`

Parsed location reference of the page. The `origin` is the domain value of `window.location.origin`, the `hostname` value will is the domain name with protocol and _www_ omitted (`https://www.brixtol.com` > `brixtol.com`). If the page does not contain search parameters or hashes then these options are omitted from the object.

#### `config{}`

Configuration model. This values defined here are applied on a per-page basis and will reflect the visits render options. These settings merge the connection defaults and attribute annotations (if defined) to instruct SPX on how to perform its rendering and cache operation.
