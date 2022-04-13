# CHANGELOG

### 09/04/2022 | v1.0.0-beta.1

This module has now moved to an major release beta candidate. Multiple breaking changes have been applied in this version. Several refactors and improvement and overall maturity. Let's get into it.

#### Smaller Size

This release is 7.9kb (gzipped). Previous versions exceeded 10kb so the module is now considerably smaller and faster.

#### New setup configuration

Previous version were using a rather complicated setup configuration model. This is breaking change and application need to update to the new config model.

```js
import * as pjax from '@brixtol/pjax';

pjax.connect({
  targets: ['body'],
  timeout: 30000,
  poll: 15,
  async: true,
  cache: true,
  reverse: true,
  limit: 25,
  proximity: {
    bounding: 0,
    threshold: 100
  },
  hover: {
    trigger: 'href',
    threshold: 100
  },
  intersect: {
    rootMargin: '',
    threshold: ''
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

#### Improved scroll tracking

The way in which scroll position was tracked between navigations in previous versions was a tad costly on performance. This update improves upon this resource heavy aspect and scrolling is recognizably more snappier as a result.

#### Pub/Sub Event Dispatching

In previous versions the module allowed methods to be hooked into via `document` event listeners. This approach is replaced with a emitter pub/sub event dispatching. This allows users to leverage the lifecycle hooks more efficiently. The `pjax.on()` methods are the new approach to lifecycle hooks.

**Old Way**

```js
// Old way
document.addEventListener('pjax:load', ({ detail: { ... }}))
```

**New Way**

```js
pjax.on('load', param => {});
```

#### Improved `<script>` tag evaluation

A new and improved approach for handling inline `<script></script>` and external `<script src="*"></script>` javascript.

#### Added `schema` option

You can now customize the attribute annotation schema.

##### Exposed snapshot method

Provided an access point to snapshots in cache. You can return the `Map` holding all snapshots using `pjax.snapshot()` or optionally return a specific reference by passing `url` parameter (eg: `pjax.snapshot(url?: string)`).

#### Transit Purge

Hover pre-fetching sometimes delay the rendering speed between navigations with transit cache has multiple pending fetches. For example, in the Brixtol Textiles webshop we leverage hover pre-fetching on collection pages, which contain multiple urls. When product images are hovered pjax goes about fetching and saving a snapshot of each url to cache but if requests have not completed and a visitor clicks a product while fetches are still in transit then the clicked product will be added to the end of the queue. This results in minor delays between visits, because the pending fetches need to conclude before new ones begin.

This version introduces a transit purge which will abort all requests in queue besides the clicked request. This will free-up the congestion and allow the navigation to proceed.

### 21/12/2021 | v0.3.0-beta.1

##### Internal Improvements

Changes to some of the internal logic, specifically how state management is handled. Prior to this release the _store_ which held reference to snapshots and page state was using the native `Map` method. While nothing wrong with this approach, it felt better to leverage objects for `key > value` mapping because we constantly query the store. This version introduces a new helper utility for this internal operation leveraging a `null` prototype object reference. This helps improve the time it takes to query the store between navigations shaving around 30 to 70 milliseconds off the time it takes between fetches and becomes rather noticeable when a large cache exists.

In addition to the new state logic, a refactor an overhaul of the store handler. Previous version the store was wrapped in a `class` but JavaScript classes are fucked. The store is now just a collection of boring old functions. This refactor shaved some kb's of the total size of the project.

##### Hydrate Method

This is a new render method that will override defined `targets` which is helpful when you want to update specific fragments (elements) in the dom without replacing the main target fragments. This method updates the trigger page cache reference.

##### Anticipatory Caching

This version provides a preemptive fetches. There are 2 additions exposed in the version, which need a little more work but can be used. A new options for **reverse** caching is available which will execute a preemptive fetch of the previous page in the history stack when no snapshot exists in cache. Snapshot cache is purged if a browser refresh occurs and when navigating backwards or pages will need to be re-fetched resulting in minor delays if a refresh was triggered between browsing. By default, the last known previous page in the history stack is now fetched.

In addition to the reverse cache feature, a **preemptive** option is now available to the `prefetch` config. This option currently accepts a string list of paths only. Values defined here will be fetched preemptively and saved to cache either upon initial load and those pages will be visited in background asynchronously in the order they were passed. In the next release preemptive fetches will be made possible according to a specific path.

##### Methods

In previous version of the beta some exposed methods were not available or working properly. This release fixes them and introduces a new `Pjax.reload()` method which will trigger a fetch and re-cache of a page, while preserving scroll position. Some other fixes and updates made in this area include:

- The `Pjax.cache(url?:string)` method will return page cache
- The `Pjax.visit(url: string, state?: IPage)` method can digest `hydrate`
- The `Pjax.clear(url?:string)` method was update to work with new store approach.

##### Full List

Below is a the complete list of changes applied in this release

- Fixed scroll position preservation between no-cached navigations
- Promise methods resolve page state correctly.
- Improved `<head>` node replacements between navigations.
- Replaced how fragments are replaced between visits.
- Added a hydration support for partial replacements
- Overhauled the store engine
- Clean up various other areas.

#### 10/08/2021 | v0.2.0-beta.1

- Convert to TypeScript
- Fix Circular Dependencies
- Remove development code
- Remove Babel logic, rely upon TS for transpilation.
- Fixed definition file
- Drop ES5 support, this is now a modern JavaScript module (ie: fuck boomers)

#### 31/03/2021 | v0.1.3-beta.1

- Tidy up code base
- Add in support for all events

#### 30/03/2021 | v0.1.2-beta.1

- Fix some type definitions
- Update Readme to to accurate description

#### 30/03/2021 | v0.1.1-beta.1

- Fixes Prefetch hover toggle between navigation
- Update Readme typos + other stuff.

#### 29/03/2021 | v0.1.0-beta.1

Initial Release
