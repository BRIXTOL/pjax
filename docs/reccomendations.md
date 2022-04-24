# Recommendations

In order to get the most out of this module below are a few recommendations developers should consider when leveraging it within in their projects. The project was developed for our use cases and while it can be appropriated into other projects there are still a couple of minor features and/or capabilities that need work, so please bare that in mind.

### Scripts

JavaScript evaluation between navigations is supported when contained `<script>` elements are contained within the document `<head>` but this highly discouraged. Avoid inline/external JavaScript and instead leverage dynamic imports (`import('.')`) within your bundle, similar to SPA architecture.

### Styles

Stylesheet and inline CSS evaluation between navigations is not yet supported. This means you need to load CSS files at runtime and any `<style>` and `<link rel="stylesheet>` elements which exist thereafter will be ignored, unless contained within targets elements. This is something we will support post-beta.

### Pre-fetching

The pre-fetching capabilities this SPX variation provides can drastically improve the speed of rendering. When used correctly pages will load instantaneously between navigations. By default, the pre-fetching features are opt-in and require attribute annotation but you can customize how, where and when SPX should execute a pre-fetch.

### Stimulus

This module was developed as a replacement for [turbo](https://github.com/hotwired/turbo) so leveraging it together with [stimulus.js](https://stimulusjs.org/) is the preferred usage. Stimulus is a very simple framework and when working with SSR projects it helps alleviate the complications developers tend to face. The reason one would choose this project over Turbo comes down to performance as this module is much faster and smaller than turbo, it's also not riddled with class OOP design patterns, just functions bae,fFunctions, functions functions.

### Minification

By default, all fetched pages are stored in memory so for every request the HTML dom string response is saved to cache. The smaller your HTML pages the more performant the rendering engine will be. In addition to minification it is generally good practice to consider using semantic HTML5 as much as possible this will help negate the amount of markup pages require.

### JavaScript

The best possible approach is to initialize JavaScript like Google Analytics and scripts which require per-page execution is to use the `SPX.on('load', function(){})` method event. This way you can be sure it will load between navigations.
