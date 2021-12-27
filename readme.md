> _This is still in beta stages, use it with care and expect some changes to be shipped before official release. Tests are still being worked on and will be pushed at official v1, sit tight._

## @brixtol/pjax

##### _THE PJAX SOLUTION TO RULE THEM ALL_

Functional, blazing fast, lightweight (9kb gzipped) and feature full new generation pjax solution for instantaneous page navigation of SSR web applications. This pjax variation supports multiple fragment replacements, advanced pre-fetching capabilities which execute via mouse, pointer, touch or intersection events and employs a snapshot caching engine to prevent subsequent requests from occurring.

### Features

- Simple and painless integration
- Pre-fetching capabilities using click, hover and intersect
- Snapshot caching engine and per-page state control.
- Powerful target and document triggered lifecycle event dispatching
- Client side DOM hydration approach approach
- Supports both append and prepend fragment replacements
- Dependency management system
- Couples perfectly with [stimulus.js](https://stimulusjs.org/).

##### Demo

We are using this module live on our [webshop](https://brixtoltextiles.com).

### Why?

The landscape of pjax based solution has become rather scarce. The current bread winners either offer the same thing or for our use case were vastly over engineered. This pjax variation couples together various techniques found to be the most effective in enhancing the performance of SSR rendered web application which are fetching pages over the wire.

## Install

```cli
pnpm add @brixtol/pjax
```

> _Because [pnpm](https://pnpm.js.org/en/cli/install) is dope and does dope shit._

## Usage

To initialize, call `Pjax.connect()` in your bundle and optionally pass preset configuration. By default it will replace the entire `<body>` fragment upon each navigation. You should define a set of `targets[]` whose inner contents should change on a per-page basis for optimal performance.

> The typings provided in this package will describe each option in good detail, below are the defaults and all options are optional.

<!-- prettier-ignore -->
```js
import * as Pjax from "@brixtol/pjax";

Pjax.connect({
  targets: ["body"], // Define fragments to be replaced here!
  cache: {
    enable: true,
    reverse: true,
    limit: 50
  },
  requests: {
    timeout: 30000,
    async: true,
    poll: 150 // You should leave this alone.
  },
  prefetch: {
    preempt: undefined, // Accepts [] or { '/path': [] }
    mouseover: {
      enable: true, // You want the speed? leave this as true.
      trigger: 'attribute',
      threshold: 100,
    },
    intersect: {
      enable: true,
      options: {
        rootMargin: "0px 0px 0px 0px",
        threshold: 1.0,
      },
    },
  },
  progress: {
    enable: true,
    threshold: 500,
    options: {
    enable: true,
    threshold: 850,
    style: {
      render: true,
      colour: 'black',
      height: '2px'
    },
    options: {
      minimum: 0.1,
      easing: 'ease',
      speed: 225,
      trickle: true,
      trickleSpeed: 225,
      showSpinner: false
    }
  }
});

```

#### Real World

Below is a real world example you can use to better understand how this module works so you can apply it into your web application. We are working on providing a live demonstration for more advanced use cases, but the below example should give you a good understanding and help you in understanding how to leverage the module.

<details>
<summary>
Example
</summary>

The first thing we want to do is make a connection with Pjax. In your JavaScript bundle, we need to initialize. Our example web application has 3 pages, the home page, about page and contact page. We are going to instruct pjax to replace the `<nav>` and `<main>` fragments on every visit and then we are going to leverage `data-pjax` attributes to replace an additional fragment when we navigate to the contact page.

<br>
<strong>JavaScript Bundle</strong>
<br>

<!-- prettier-ignore -->
```javascript
import * as Pjax from "@brixtol/pjax";

export default () => {

  Pjax.connect({
    targets: [
      "nav",
      "main"
    ],
  })

}

```

**Home Page**

<br>
Below we have a very basic Home Page with pjax wired up and all `<a>` elements will be intercepted and cached. SSR web application (in most cases) will only ever have a couple of fragments that change between navigation, so keeping to that logic lets begin..

<!-- prettier-ignore -->
```html

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Home Page</title>
    <script src="/bundle.js"></script>
  </head>
  <body>

    <header>

      <h1>@brixtol/pjax</h1>

      <!-- THIS FRAGMENT WILL BE REPLACED -->
      <nav>

        <!-- This link will be intercepted -->
        <a
         href="/home"
         class="active">Home</a>

        <!-- These links will be pe-fetched on hover -->
        <a
         href="/about"
         data-pjax-prefetch="hover">About</a>

        <!-- This link will replace the #foo fragment -->
        <a
         href="/contact"
         data-pjax-replace="(['#foo'])"
         data-pjax-prefetch="hover">Faq</a>
      </nav>

    </header>

    <!-- THIS FRAGMENT WILL BE REPLACED -->
    <main>

      <h1>Welcome to the home page</h1>

      <div class="container">
        Brixtol Textiles is a Swedish apparel brand!
      </div>

    </main>

    <div id="foo">
      This fragment will not be touched until /contact is clicked
    </div>

    <footer>
      This will not be touched during navigation
    </footer>

  </body>
</html>

```

**About Page**
<br>
The about page in our web application would look practically identical to the home page. We instructed pjax to pre-fetch this page upon hover, so navigating to this page will be instantaneous. The about page only has some minor differences, but for the sake of clarity, lets have look:

<!-- prettier-ignore -->
```html

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>About Page</title>
    <script src="/bundle.js"></script>
  </head>
  <body>

    <header>

      <h1>@brixtol/pjax</h1>

      <!-- THIS FRAGMENT WILL BE REPLACED -->
      <nav>

        <!-- This link will be intercepted -->
        <a
         href="/home">Home</a>

        <!-- These links will be pe-fetched on hover -->
        <a
         href="/about"
         class="active"
         data-pjax-prefetch="hover">About</a>

        <!-- This link will replace the #foo fragment -->
        <a
         href="/contact"
         data-pjax-replace="(['#foo'])"
         data-pjax-prefetch="hover">Contact</a>
      </nav>

    </header>

    <!-- THIS FRAGMENT WILL BE REPLACED -->
    <main>

      <h1>Welcome to the About Page</h1>

      <div class="container">
        Brixtol Textiles makes jackets out of recycled PET bottles.
        <p>Producing clothing in a sustainable way is the future!</p>
      </div>

    </main>

    <div id="foo">
      This fragment will not be touched until /contact is clicked
    </div>

    <footer>
      This will not be touched during navigation
    </footer>

  </body>
</html>
```

**Contact Page**
<br>
The contact page will replace an additional fragment with the id value of `foo` which we instructed via attribute annotation. When the contact page link is hovered the page will be saved to cache, upon visit the `<nav>`, `<main>` and `<div id="foo">` fragments will be replaced.

<!-- prettier-ignore -->
```html

<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Contact Page</title>
    <script src="/bundle.js"></script>
  </head>
  <body>

    <header>

      <h1>@brixtol/pjax</h1>

      <!-- THIS FRAGMENT WILL BE REPLACED -->
      <nav>

        <!-- This link will be intercepted -->
        <a
         href="/home">Home</a>

        <!-- These links will be pe-fetched on hover -->
        <a
         href="/about"
         data-pjax-prefetch="hover">About</a>

        <!-- This link will replace the #foo fragment -->
        <a
         href="/contact"
         class="active"
         data-pjax-replace="(['#foo'])"
         data-pjax-prefetch="hover">Contact</a>
      </nav>

    </header>

    <!-- THIS FRAGMENT WILL BE REPLACED -->
    <main>

      <h1>Welcome to the Contact Page</h1>

      <div class="container">
        This is contact page of our example! The below fragment was replaced too!
      </div>

    </main>

    <!-- THIS FRAGMENT WAS REPLACE VIA ATTRIBUTE INSTRUCTION -->
    <div id="foo">
      This fragment was replaced!
    </div>

    <footer>
      This will not be touched during navigation
    </footer>

  </body>
</html>
```

</details>

## Lifecycle Events

Lifecycle events are dispatched to the document upon each navigation. You can access contextual information from within `event.detail` or cancel events with `preventDefault()` or by returning boolean `false` to prevent execution from occurring.

<!-- prettier-ignore -->
```javascript

// Triggered when a prefetch is triggered
document.addEventListener("pjax:prefetch");

// Triggered when a mousedown event occurs on a link
document.addEventListener("pjax:trigger");

// Triggered before a page is fetched over XHR
document.addEventListener("pjax:request");

// Triggered before a page is cached
document.addEventListener("pjax:cache");

// Triggered before a page or fragment is rendered
document.addEventListener("pjax:render");

// Triggered before a fragment is hydrated
document.addEventListener("pjax:hydrate"); // { detail: { target: HTMLElement } }

// Triggered after a page has rendered
document.addEventListener("pjax:load");

// Triggered when a JavaScript module is loaded
document.addEventListener("pjax:module");
```

## Methods

In addition to Lifecycle events, you also have a list of methods available. Methods will allow you some basic programmatic control of the Pjax session.

```typescript

// Check to see if Pjax is supported by the browser
Pjax.supported: boolean

// Connects Pjax, called upon initialization
Pjax.connect(options?): void

// Execute a programmatic visit
Pjax.visit(url?, options?): Promise<Page{}>

// Access the cache, pass in href for specific record
Pjax.cache(url?): Page{}

// Clears the cache, pass in href to clear specific record
Pjax.clear(url?): void

// Returns a UUID string via nanoid
Pjax.uuid(size = 16): string

// Reloads the current page
Pjax.reload(): Page{}

// Disconnects Pjax
Pjax.disconnect(): void

```

## Attributes

Link elements can be annotated with `data-pjax` attributes. You can control how pages are rendered by passing the below attributes on `<a>` elements.

#### data-pjax-eval

Used on resources contained within `<head>` fragment like styles and scripts. Use this attribute if you want pjax the evaluate scripts and/or stylesheets. This option accepts a `false` value so you can define which scripts to execute on each navigation. By default, pjax will run and evaluate all `<script>` tags it detects for every page visit but will not re-evaluate `<script src="*"></script>` tags.

> If a script tag is detected on pjax navigation and is using `data-pjax-eval="false"` it will execute only once upon the first visit but never again after that.

<details>
<summary>
Example
</summary>

```html
<script>
  console.log('I will run on every navigation');
</script>

<!-- script will also run once if detected on pjax navigation -->
<script data-pjax-eval="false">
  console.log('I will run on initialization only!');
</script>
```

</details>

#### data-pjax-disable

Place on `href` elements you don't want pjax navigation to be executed. When a link element is annotated with `data-pjax-disable` a normal page navigation will be executed and cache will be cleared.

<details>
<summary>
Example
</summary>

Clicking this link will clear cache and a normal page navigation will be executed.

```html
<a href="*" data-pjax-disable></a>
```

</details>

#### data-pjax-track

Place on elements to track on a per-page basis that might otherwise not be contained within target elements.

<details>
<summary>
Example
</summary>

Lets assume you are navigating from `Page 1` to `Page 2` and `#main` is your defined target. When you navigate from `Page 1` only the `#main` target will be replaced and any other dom elements will be skipped which are not contained within `#main`. Elements located outside of target/s that do no exist on previous or future pages will be added.

**Page 1**

```html
<nav>
  <a href="/page-1" class="active">Page 1</a>
  <a href="/page-2">Page 2</a>
</nav>

<div id="#main">
  <div class="block">I will be replaced, I am active on every page.</div>
</div>
```

**Page 2**

```html
<nav>
  <a href="/page-1">Page 1</a>
  <a href="/page-2" class="active">Page 2</a>
</nav>

<div id="#main">
  <div class="block">I will be replaced, I am active on every page.</div>
</div>

<!-- This element will be appended to the dom -->
<div data-pjax-track>
  I am outside of target and will be tracked if Pjax was initialized on Page 1
</div>

<!-- This element will not be appended to the dom -->
<div>I will not be tracked unless Pjax was initialized on Page 2</div>
```

> If pjax was initialized on `Page 2` then Pjax would have knowledge of its existence before navigation. In such a situation, pjax will mark the tracked element internally.

</details>

#### data-pjax-hydrate

Executes a replacement of the defined elements. Hydrate is different from `replace`, `append` and `prepend` methods in the sense that the those are combined with your defined `targets`. When calling Hydrate, it will run precedence over `targets` and for the visit it will replace only the element/s provided.

- `(['target'])`
- `(['target' , 'target'])`

<details>
<summary>
Example
</summary>

<!-- prettier-ignore -->
```html

<a
 href="*"
 data-pjax-hydrate="(['.price', '.cart-count'])">
 Link
</a>

<div>
  The next navigation will replace all elements with class "price"
  and the elements with class "cart-count" - If you have defined
  the element "#main" as a "target" in your connection, a replacement
  will not be made on that element, instead the elements defined in
  "data-pjax-hydrate" will become the target/s.
</div>


<span class="cart-count">1</span>
<span class="price">€ 450</span>

<div id="main">
  <img src="*">
  <ul>
    <li>Great Product</li>
    <li class="price">€ 100</li>
    <li>Awesome Product</li>
    <li class="price">€ 200</li>
    <li>Cool Product</li>
    <li class="price">€ 300</li>
  </ul>
</div>


```

</details>

#### data-pjax-replace

Executes a replacement of defined targets, where each target defined in the array is replaced.

- `(['target'])`
- `(['target' , 'target'])`

<details>
<summary>
Example
</summary>

<!-- prettier-ignore -->
```html

<a
 href="*"
 data-pjax-replace="(['#target1', '#target2'])">
 Link
</a>

<div id="target1">
  I will be replaced on next navigation
</div>

<div id="target2">
  I will be replaced on next navigation
</div>

```

</details>

#### data-pjax-prepend

Executes a prepend visit, where `[0]` will prepend itself to `[1]` defined in that value. Multiple prepend actions can be defined. Each prepend action is recorded are marked.

- `(['target' , 'target'])`
- `(['target' , 'target'], ['target' , 'target'])`

<details>
<summary>
Example
</summary>

**PAGE 1**

<!-- prettier-ignore -->
```html

<a
 href="*"
 data-pjax-prepend="(['#target-1', '#target-2'])">
 Page 2
</a>

<div id="target-1">
  I will prepend to target-2 on next navigation
</div>

<div id="target-2">
  <p>target-1 will prepended to me on next navigation</p>
</div>

```

**PAGE 2**

<!-- prettier-ignore -->
```html

<a
 href="*"
 data-pjax-prepend="(['#target-1', '#target-2'])">
 Page 2
</a>

<div id="target-2">

  <!-- An action reference record is applied -->
  <div data-pjax-action="xxxxxxx">
    I am target-1 and have been prepended to target-2
  </div>

  <p>target-1 is now prepended to me</p>

</div>

```

</details>

#### data-pjax-prefetch

Prefetch option to execute. Accepts either `intersect` or `hover` value. When `intersect` is provided a request will be dispatched and cached upon visibility via Intersection Observer, whereas `hover` will dispatch a request upon a pointerover (mouseover) event.

> On mobile devices the `hover` value will execute on a `touchstart` event

<details>
<summary>
Example
</summary>

```html
<!-- This link will be prefetch when it is hovered -->
<a data-pjax-prefetch="hover" href="*"></a>

<!-- This link will be prefetch when it is in viewport -->
<a data-pjax-prefetch="intersect" href="*"></a>
```

</details>

#### data-pjax-threshold

Set the threshold delay timeout for hover prefetches. By default, this will be set to `100` or whatever preset configuration was defined in `Pjax.connect()` but you can override those settings by annotating the link with this attribute.

<details>
<summary>
Example
</summary>

```html
<!-- hover prefetch will begin according to the connect preset -->
<!-- prefetch will not be initialized if a click was detected before threshold -->
<a data-pjax-prefetch="hover" href="*"></a>

<!-- prefetch will begin 500ms after hover but will cancel if mouse existed before threshold -->
<a data-pjax-prefetch="hover" data-pjax-threshold="500" href="*"></a>

<!-- Prefetch will begin once this link becomes visible in viewport -->
<a data-pjax-prefetch="intersect" href="*"></a>
```

</details>

#### data-pjax-position

Scroll position of the next navigation. Space separated expression with colon separated prop and value.

<details>
<summary>
Example
</summary>

```html
<!-- This next navigation will load at 1000px from top of page  -->

<a data-pjax-position="y:1000 x:0" href="*"></a>
```

</details>

#### data-pjax-cache

Controls the caching engine for the link navigation. Accepts `false`, `reset` or `clear` value. Passing in `false` will execute a pjax visit that will not be saved to cache and if the link exists in cache it will be removed. When passing `reset` the cache record will be removed, a new pjax visit will be executed and its result saved to cache. The `clear` option will clear the entire cache.

<details>
<summary>
Example
</summary>

```html
<a data-pjax-cache="false" href="*"></a>
```

</details>

#### data-pjax-history

Controls the history pushstate for the navigation. Accepts `false`, `replace` or `push` value. Passing in `false`will prevent this navigation from being added to history. Passing in `replace` or `push` will execute its respective value to pushstate to history.

<details>
<summary>
Example
</summary>

```html
<!-- the navigation not be pushed to history -->
<a data-pjax-history="false" href="*"></a>
```

</details>

#### data-pjax-progress

Controls the progress bar delay. By default, progress will use the threshold defined in configuration presets defined upon connection, else it will use the value defined on link attributes. Passing in a value of `false` will disable the progress from showing.

<details>
<summary>
Example
</summary>

```html
<!-- Progress bar will be displayed if the request exceeds 500ms -->
<a data-pjax-progress="500" href="*"></a>
```

</details>

## State

Each page visited has a state value. Page state is immutable and created for every unique url `/path` or `/pathname?query=param` value that has been encountered throughout the pjax session. The state value of each page is added to its pertaining History stack record and will referenced on subsequent visits. This approach drastically improves TTFB.

> Navigation sessions begin once a Pjax connection has been established and ends when a browser refresh is executed or url origin changes.

#### Read

You can access a readonly copy of page via the `event.details.state` property passed in certain dispatched lifecycle events or via the `Pjax.cache()` method. The caching engine used by this Pjax variation acts as mediator when a session begins. When you access page state via the `Pjax.cache()` method you are given a bridge to the object that holds all active session cache data.

#### Write

State modifications are carried out via link attributes, when executing a programmatic visit using the `Pjax.visit()` method or from within dispatched events. When using the `Pjax.visit()` method you can pass state modification via the `options` parameter and will be merged before the visit begins. Though this method will only allow you to modify the next navigation you should avoid modifying state outside of the available methods and instead treat it as readonly.

```typescript
interface IPage {
  /**
   * The list of fragment target element selectors defined upon connection.
   * Targets are inherited from `Pjax.connect()` presets.
   *
   * > You cannot override the targets but you can skip replacements using
   * `hydrate` to replace specific fragments.
   *
   * @example
   * ['#main', '.header', '[data-attr]', 'header']
   */
  readonly targets?: string[];

  /**
   * The URL cache key and current url path
   */
  url?: string;

  /**
   * UUID reference to the page snapshot HTML Document element
   */
  snapshot?: string;

  /**
   * The Document title
   */
  title?: string;

  /**
   * Should this fetch be pushed to history
   */
  history?: boolean;

  /**
   * List of fragments to replace. When `hydrate` is used,
   * it will run precedence over `targets` and execute replacements
   * on the triggered page fragments.
   *
   * @example
   * ['#main', '.header', '[data-attr]', 'header']
   */
  hyrdate?: null | string[];

  /**
   * List of fragment element selectors. Accepts any valid
   * `querySelector()` string.
   *
   * @example
   * ['#main', '.header', '[data-attr]', 'header']
   */
  replace?: null | string[];

  /**
   * List of fragments to append from and to. Accepts multiple.
   *
   * @example
   *
   * [['#main', '.header'], ['[data-attr]', 'header']]
   */
  append?: null | Array<[from: string, to: string]>;

  /**
   * List of fragments to be prepend from and to. Accepts multiple.
   *
   * @example
   *
   * [['#main', '.header'], ['[data-attr]', 'header']]
   */
  prepend?: null | Array<[from: string, to: string]>;

  /**
   * Controls the caching engine for the link navigation.
   * Option is enabled when `cache` preset config is `true`.
   * Each pjax link can set a different cache option.
   */
  cache?: boolean | 'reset' | 'clear';

  /**
   * Define mouseover timeout from which fetching will begin
   * after time spent on mouseover
   *
   * @default 100
   */
  threshold?: number;

  /**
   * Define proximity prefetch distance from which fetching will
   * begin relative to the cursor offset of href elements.
   *
   * @default 0
   */
  proximity?: number;

  /**
   * Progress bar threshold delay
   *
   * @default 350
   */
  progress?: boolean | number;

  /**
   * Scroll position of the next navigation.
   *
   * ---
   * `x` - Equivalent to `scrollLeft` in pixels
   *
   * `y` - Equivalent to `scrollTop` in pixels
   */
  position?: {
    y: number;
    x: number;
  };

  /**
   * Location URL
   */
  location?: {
    /**
     * The URL origin name
     *
     * @example
     * 'https://website.com'
     */
    origin?: string;
    /**
     * The URL Hostname
     *
     * @example
     * 'website.com'
     */
    hostname?: string;

    /**
     * The URL Pathname
     *
     * @example
     * '/pathname' OR '/pathname/foo/bar'
     */
    pathname?: string;

    /**
     * The URL search params
     *
     * @example
     * '?param=foo&bar=baz'
     */
    search?: string;

    /**
     * The URL Hash
     *
     * @example
     * '#foo'
     */
    hash?: string;

    /**
     * The previous page path URL, this is also the cache identifier.
     * If `cache.reverse` is `true` then preemptive fetches will be
     * executed to this location.
     *
     * @example
     * '/pathname' OR '/pathname?foo=bar'
     */
    lastpath?: string;
  };
}
```

## Contributing

This module is written in TypeScript. Production bundles exports to ES2015. This project has been open sourced from within a predominantly closed source mono/multi repo. We will update it according to what we need. Feel free to suggest features or report bugs and PR's are welcome!

## Acknowledgements

This module combines concepts originally introduced by other awesome Open Source projects:

- [Defunkt Pjax](https://github.com/defunkt/jquery-pjax)
- [Pjax.js](https://github.com/brcontainer/pjax.js)
- [MoOx Pjax](https://github.com/MoOx/pjax)
- [InstantClick](https://github.com/dieulot/instantclick)
- [Turbo](https://github.com/hotwired/turbo)
- [Turbolinks](https://github.com/turbolinks/turbolinks)

## License

Licensed under [MIT](#LICENCE)

---

We [♡](https://www.brixtoltextiles.com/discount/4D3V3L0P3RS]) open source!
