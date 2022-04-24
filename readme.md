# SPX

### BETA VERSION

SPX (Single Page XHR) is a blazing fast, lightweight (7.4kb gzipped) and feature full new generation pjax solution. SPX supports advanced pre-fetching capabilities, multiple fragment replacements and snapshot caching engine that prevents subsequent requests from occurring resulting in instantaneous navigations.

### Features

- Simple and painless drop-in integration.
- Pre-fetching capabilities using hover, intersection or proximity observers.
- Snapshot caching engine and per-page state control.
- Powerful pub/sub event driven lifecycle triggers.
- Provides a client side DOM hydration approach.
- Supports multiple replace, append and prepend fragment targets.
- Handles inlined and external script evaluation.
- Couples perfectly with [stimulus.js](https://stimulusjs.org/).
- Attribute driven programmatic control.

### Demo

We are using this module live on our [webshop](https://brixtoltextiles.com).

### Why?

The landscape of Pjax (Push~State Ajax) solutions has become rather scarce. The current bread winners tend to offer the same thing and we wanted to push the limits. SPX couples together various techniques found to be the most effective in enhancing the performance of SSR rendered web application which fetch pages over the wire.

# Documentation

1. [Install](#install)
2. [Usage](#usage)
3. [Options](#options)
4. [Lifecycle Events](#lifecycle-events)
5. [Methods](#methods)
6. [Contributing](#contributing)
7. [Acknowledgements](#acknowledgements)

# Install

This module is distributed as ESM and designed to work in the browser environment.

### pnpm

```cli
pnpm add spx
```

_Because [pnpm](https://pnpm.js.org/en/cli/install) is dope and does dope shit._

### Yarn

```cli
yarn add spx
```

_Yarn sucks. Choose [pnpm](https://pnpm.js.org/en/cli/install) and emancipate yourself._

### npm

```cli
npm i spx
```

_Okay, Boomer..._

### cdn

```
https://unpkg.com/spx
```

_Be as you are.._

# Usage

To initialize, call `spx.connect()` in your bundle preferably before anything else is loaded. By default, the entire `<body>` fragment is replaced upon each navigation. You should define a set of `targets[]` whose inner contents change on a per-page basis.Consider leveraging the pre-fetching capabilities for the most optimal performance.

> The typings provided in this package will describe each option in good detail, below are the defaults. Settings are optional.

```js
import spx from 'spx';

spx.connect({
  targets: ['body'],
  schema: 'spx',
  timeout: 30000,
  poll: 15,
  async: true,
  cache: true,
  session: false,
  limit: 50,
  preload: null,
  hover: {
    trigger: 'attribute',
    threshold: 250
  },
  intersect: {
    rootMargin: '',
    threshold: 0
  },
  proximity: {
    distance: 85,
    throttle: 500,
    threshold: 250
  },
  progress: {
    minimum: 0.08,
    easing: 'linear',
    speed: 200,
    trickle: true,
    threshold: 500,
    trickleSpeed: 200
  }
});
```

# Options

#### `targets`

Define page fragment targets which are expected to change on a per-page basis. By default, SPX will replace the entire `<body>` fragment but it is best to define specific fragments.

**Type:** `string[]` <br>
**Default:** `['body']` <br>

#### `schema`

By default, attribute identifiers use a `-spx-` identifier. You can use a custom attribute identifier or if you wish to opt-out of an identifier you can pass `null` so annotations can be expressed using `data-` only.

**Type:** `string` <br>
**Default:** `spx` <br>

#### `timeout`

Request polling limit is used when a request is already in transit. Request completion is checked every 10ms, by default this is set to `30000` which means requests will wait `30s` before being a new request is triggered.

#### `poll`

Request polling limit is used when a request is already in transit. Request completion is checked every 10ms, by default this is set to `1000` which means requests will wait `1s` before being a new request is triggered.

**Type:** `number` <br>
**Default:** `1000` <br>

#### `async`

Determine if page requests should be fetched asynchronously or synchronously. Setting this to `false` is not recommended.

**Type:** `boolean` <br>
**Default:** `true` <br>

#### `cache`

Enable or Disable caching. Each page visit request is cached and used in subsequent visits to the same location. Setting this to `false` is discourage as all visits will be fetched over the network and `data-spx-cache` attribute configs will be ignored.

> If `cache` is disabled then prefetches will be dispatched using HTML5 `<link>` prefetches, else when cache is enabled it uses XHR.

**Type:** `boolean` <br>
**Default:** `true` <br>

#### `persist`

The `persist` option can be used to restore cache into memory after a browser refresh has been triggered. When persisting cache a reference is maintained in session storage.

**Type:** `boolean` <br>
**Default:** `false` <br>

#### `limit`

Cache size limit. This pjax variation limits cache size to `50mb`and once it exceeds that limit, records will be removed starting from the earliest point of known cache entries.

**Type:** `number` <br>
**Default:** `50` <br>

#### `hover`

Hover pre-fetching. You can disable hover pre-fetching by setting this to `false` which will prevent observers from executing and any `data-spx-hover` attributes will be ignored. To use the default configurations you can set this to `true` or simply omit it.

**Type:** `boolean` or `object` <br>
**Default:** `{ trigger: 'attribute', threshold: 250 }` <br>

#### `hover.trigger`

How hover prefetches should be triggered. By default this option is set to trigger only when `<a>` href link elements are attributed with a `data-spx-hover` attribute. You can instruct pjax to execute pre-fetching on all `<a>` elements by setting this option to `href`. If you set the trigger to `href` you can annotate links you wish to exclude from prefetch with `data-spx-hover="false"`.

**Type:** `string` <br>
**Accepts:** `attribute` or `href` <br>
**Default:** `attribute` <br>

#### `hover.threshold`

Controls the fetch delay threshold. Requests will fire only when the mouse is both within range and the threshold time limit defined here has exceeded.

**Type:** `number` <br>
**Default:** `250` <br>

#### `proximity`

Proximity pre-fetching allow for requests to be dispatched when the cursor is within a proximity range of a href link element. Coupling proximity with mouseover prefetches enable predicative fetching to occur, so a request will trigger before any interaction with a link element happens. To use default behavior, set this to `true` and all `<a>` annotated with a `data-spx-proximity` attribute will be pre-fetched.

> Annotate any `<a>` links you wish to exclude from pre-fetching using the `data-spx-proximity="false"`

**Type:** `boolean` or `object` <br>
**Default:** `{ distance: 75, throttle: 500, threshold: 250 }` <br>

#### `proximity.distance`

The distance range the mouse should be within before the prefetch is triggered. You can optionally override this by assigning a number value to the proximity attribute. An href element using `data-spx-proximity="50"` would inform Pjax to begin fetching when the mouse is within `50px` of the element.

**Type:** `number` <br>
**Default:** `75` <br>

#### `proximity.throttle`

Controls the fetch delay threshold. Requests will fire only when the mouse is both within range and the threshold time limit defined here has exceeded.

**Type:** `number` <br>
**Default:** `250` <br>

#### `proximity.threshold`

Controls the fetch delay threshold. Requests will fire only when the mouse has exceeded the range and the threshold time limit defined here has been exceeded.

**Type:** `number` <br>
**Default:** `250` <br>

#### `intersect`

Intersection pre-fetching. Intersect pre-fetching leverages the [Intersection Observer](https://shorturl.at/drLW9) API to fire requests when elements become visible in viewport. You can disable intersect pre-fetching by setting this to `false`, otherwise you can customize the intersect fetching behavior. To use default behavior, set this to `true` and all elements annotated with with a `data-spx-intersect` or `data-spx-intersect="true"` attribute will be pre-fetched. You can annotate elements that contain href links or `<a>` elements directly.

> Annotate any `<a>` links you wish to exclude from intersection pre-fetching using the `data-spx-intersect="false"`

**Type:** `boolean` or `object` <br>
**Default:** `{ rootMargin: '0px 0px 0px 0px', throttle: 0 }` <br>

#### `intersect.rootMargin`

An offset rectangle applied to the root's href bounding box. The option is passed to the Intersection Observer.

**Type:** `string` <br>
**Default:** `0px 0px 0px 0px` <br>

#### `intersect.throttle`

Throttle limit passed to the intersection observer instance.

**Type:** `number` <br>
**Default:** `500` <br>

# Lifecycle Events

Lifecycle events are dispatched to the document upon each navigation. You can access contextual information in the parameters. You can also cancel events with `preventDefault()` or by returning boolean `false` if you wish to prevent execution from occurring in a certain lifecycle.

The Pjax lifecycle events are dispatched in the following order of execution:

1. **connected**
2. **prefetch**
3. **visit**
4. **fetch**
5. **store**
6. **route**
7. **render**
8. **load**

### Events

<!-- prettier-ignore -->
```typescript
import spx from 'spx'

spx.on('connected', (state?: IPage, session?: ISession) => void)

spx.on('prefetch', (trigger?: Element, location?: ILocation) => void | false): PrefetchEvent

spx.on('visit', (event?: Event) => void | false): VisitEvent

spx.on('fetch', (state?: IState) => void | false): FetchEvent

spx.on('store', (state?: IState, dom?: Document) => void | false | Document): StoreEvent

spx.on('hydrate', (target?: Element, newTarget?: Element) => void | false): HydrateEvent

spx.on('render', (target?: Element, newTarget?: Element) => void | false): RenderEvent

spx.on('load', (state?: IPage) => void): LoadEvent

```

## connected

The connected event will be triggered after SPX has connected and fired only once. This is the equivalent of the `DOMContentLoaded` event. Upon connection, SPX will save the current documents outer HTML to the snapshot cache using `document.documentElement.outerHTML` whereas all additional snapshots are saved after an XHR request completes.

Because the initial snapshot is saved using `document.documentElement.outerHTML` the captured HTML may cause third party scripts which have augmented the document to serve an invalid dom into the snapshot cache. When a return navigation to this location occurs it may cause the third party script to fail. You can prevent issues of this nature from happening by initializing your modules within the `connected` event.

**Cancellable:** `false` <br>
**Asynchronous:** `false`

## prefetch

The prefetch event will be triggered for every prefetch request. Prefetch requests are fired when `hover`, `intersect` and `proximity` are triggered. This event will be frequently triggered if you are leveraging any of those capabilities. You can determine the type of prefetch which has occurred via the `type` parameter.

**Cancellable:** `false` <br>
**Asynchronous:** `true`

## visit

The visit event will be triggered when a `mousedown` event has occurred on a SPX enabled `href` element. This is the equivalent of a `click` and when such an action occurs then navigation intent is assumed and visit begins.

**Cancellable:** `false` <br>
**Asynchronous:** `false`

## request

The request event will be triggered before an XHR request begins and a page is fetched. This event will be fired for `prefetch`, `hydrate` and `trigger` actions. You can determine the trigger action for the request using the `type` property passed in the `event.detail` parameter.

**Cancellable:** `false` <br>
**Asynchronous:** `true`

## cache

The cache event will be triggered immediately after a request has finished and before the snapshot and page record is saved to memory. You can determine the trigger action for the request via the `type` parameter. This Lifecycle also allows you to augment the snapshot `Document` and before it is saved.

**Cancellable:** `false` <br>
**Asynchronous:** `false`

## render

The render event will be triggered before a page or fragment is rendered (replaced) in the dom. For every `target` you've defined this event will fire. You can determine which elements are being replaced via the `target` and `newTarget` parameters passed. The `target` property represents the current element that will be replaced and the `newTarget` element represents the new target which it will be replaced with.

**Cancellable:** `false` <br>
**Asynchronous:** `false`

## hydrate

The hydrate event is identical to the `render` event. The parameters represent the current `target` and `newTarget` elements which will be replaced.

**Cancellable:** `false` <br>
**Asynchronous:** `false`

## load

The load event is the final lifecycle event to be triggered. Use this event to re-initialize any third party scripts. The load event will only execute after navigation has concluded.

**Cancellable:** `false` <br>
**Asynchronous:** `false`

# Routing

The module exposes a low-level routing approach using simple wildcard path matching. Routes executed right before fragments are replaced in the rendering lifecycle. Routes allow you to augment the target documents and state before replacement occur.

<!-- prettier-ignore -->
```typescript
import spx from 'spx'

spx.route({

  '/:value': (state?: IState, target?: IRoute) => void | Document,

  '/path/*': (state?: IState, target?: IRoute) => void | Document,

  '/?param': (state?: IState, target?: IRoute) => void | Document

});
```

# Methods

In addition to Lifecycle events, you also have a list of methods available. Methods will allow you some basic programmatic control of the SPX session occurring, provides access to the cache store and various other operational utilities.

```typescript
import spx from 'spx'

spx.supported: boolean

spx.connect(options?: {}): void

spx.session(store?: string, merge?:{}): ISession

spx.hydrate(url?: string, targets: string[]): Promise<IPage>

spx.fetch(url: string): Promise<Document>

spx.prefetch(string | Element): Promise<IPage>

spx.visit(url: string, options?:{}): Promise<IPage>

spx.state(url?: string, merge?:{}): Page{}

spx.capture(targets: string[]): Promise<Element[]>

spx.clear(url?: string): void

spx.reload(): IPage

spx.disconnect(): void

```

#### `spx.connect(options?)`

The `connect` method is a **required** call and will initialize a SPX session. You can optionally provide options which inform SPX on how it should behave. See [options](#options) for list of settings.

**Returns:** `void`
**Dispatched Events:** `connected` <br>

#### `spx.session()`

The `session` method will return the current store instance. This includes all state, snapshots, options and settings of the current session which exists in memory. If you intend of augmenting the session, please note that the store records are created without prototype.

**Returns:** `Promise<IPage>`

#### `spx.hydrate(url: string, targets: string[])`

The `hydrate` method executed a programmatic hydration. The method expects a `url` and string list of element selectors.

**Returns:** `Promise<IPage>`<br>
**Events:** `cache > hydrate > load`

#### `spx.fetch(url: string)`

Triggers a programmatic fetch. The XHR request response is not cached and no state reference are touched.

**Returns:** `Document`<br>

#### `spx.prefetch(link: string | Element)`

The `prefetch` method executed a programmatic Prefetch. The method expects a `url` or `<a href="*"></a>` node as an argument. This method behaves the same way as hover, intersect of proximity prefetches.

**Returns:** `Promise<IPage>`<br>
**Events:** `request > cache`

#### `spx.visit(url: string, options?: IOptions)`

The `visit` method executed a programmatic trigger visit. The method expects a `url` as an argument and optionally accepts an page state options model. This method behaves the same way as trigger.

**Returns:** `Promise<IPage>`<br>
**Events:** `replace > request > cache > render > load`

#### `spx.state(url?: string, state?: IState)`

The `state` method returns the records pertaining to the provided `url` or if not defined returns the current location. Optionally pass a `state` object reference to merge and augment the current references.

**Returns:** `Promise<IPage>`

#### `spx.capture(targets: string[])`

The `capture` method performs a snapshot modification to the current document. Use this to align a snapshot cache record between navigations. This is helpful in situations where the dom is augmented and you want to preserve

**Returns:** `Promise<IPage>`

# How it works?

This SPX variation is leveraging modern browser capabilities. What makes this SPX variant faster than others is how the pages are fetched and the caching approach it employs.

### Fetching

Pages are fetches using XHR opposed to the Fetch API as we are dealing with HTML requests there is no benefit of using Fetch over XHR.

### Pre-fetching

TODO

### Rendering

1. An XHR request can begin on mousedown, mouseover, element intersection or via cursor proximity.
2. The response DOM string of fetched pages is stored in memory, so page requests are only ever executed once.
3. Stored pages (snapshots) are re-used when returning visits to cached (stored) locations occur.
4. The DOM Parser API is used in the rendering cycle, only specific elements (targets) are replaced.
5. The state model of the History API is used maintain page specific configuration references.

# Contributing

This module is written in TypeScript. Production bundles exports to ES2015. This project has been open sourced from within a predominantly closed source mono/multi repo. We will update it according to what we need. Feel free to suggest features or report bugs and PR's are welcome!

### Development

The project is functional in its architecture, there are no classes, just functions. The [observers](https://github.com/BRIXTOL/pjax/blob/master/src/observers) directory contains the various fetch and pre-fetch logics. Objects avoid the prototype and `Object.create(null)` is the preferred approach.

The project is fairly easy to understand, there are no complexities and over-engineering. The Pjax method is simple, you fetch pages over the wire and replace elements in the rendering cycle. This module follows this pattern but includes additional extras to help improve the rendering times.

# Acknowledgements

This module combines concepts originally introduced by other awesome Open Source projects:

- [Defunkt Pjax](https://github.com/defunkt/jquery-pjax)
- [pjax.js](https://github.com/brcontainer/pjax.js)
- [MoOx Pjax](https://github.com/MoOx/pjax)
- [InstantClick](https://github.com/dieulot/instantclick)
- [Turbo](https://github.com/hotwired/turbo)
- [Turbolinks](https://github.com/turbolinks/turbolinks)

# Special Thanks

Special Thanks/Спасибі to [Alexey](https://github.com/gigi) for the **SPX** registry name.

# License

Licensed under [MIT](#LICENSE)

---

We [♡](https://www.brixtoltextiles.com/discount/4D3V3L0P3RS]) open source!
