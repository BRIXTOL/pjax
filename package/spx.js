const history = window.history;
const origin = window.location.origin;
const assign = Object.assign;
const object = Object.create;
const isArray$1 = Array.isArray;
const toArray = Array.from;
const nil = "";

function defaults() {
  const state = object(null);
  state.targets = ["body"];
  state.timeout = 3e4;
  state.poll = 15;
  state.schema = "spx";
  state.async = true;
  state.cache = true;
  state.limit = 50;
  state.preload = null;
  state.session = false;
  state.hover = object(null);
  state.hover.trigger = "attribute";
  state.hover.threshold = 250;
  state.intersect = object(null);
  state.intersect.rootMargin = "0px 0px 0px 0px";
  state.intersect.threshold = 0;
  state.proximity = object(null);
  state.proximity.distance = 75;
  state.proximity.threshold = 250;
  state.proximity.throttle = 500;
  state.progress = object(null);
  state.progress.background = "#111";
  state.progress.height = "3px";
  state.progress.minimum = 0.09;
  state.progress.easing = "linear";
  state.progress.speed = 300;
  state.progress.trickle = true;
  state.progress.threshold = 500;
  state.progress.trickleSpeed = 300;
  return state;
}

const config = defaults();
const observers = object(null);
const memory = object(null);
const selectors = object(null);
const pages = object(null);
const snapshots = object(null);
const tracked = /* @__PURE__ */ new Set();

var Attributes = /* @__PURE__ */ ((Attributes2) => {
  Attributes2["NAMES"] = "hydrate|append|prepend|replace|progress|threshold|position|proximity|hover";
  return Attributes2;
})(Attributes || {});
var Errors = /* @__PURE__ */ ((Errors2) => {
  Errors2[Errors2["INFO"] = 1] = "INFO";
  Errors2[Errors2["WARN"] = 2] = "WARN";
  Errors2[Errors2["TYPE"] = 3] = "TYPE";
  Errors2[Errors2["ERROR"] = 4] = "ERROR";
  return Errors2;
})(Errors || {});
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2[EventType2["INITIAL"] = 1] = "INITIAL";
  EventType2[EventType2["VISIT"] = 2] = "VISIT";
  EventType2[EventType2["HYDRATE"] = 3] = "HYDRATE";
  EventType2[EventType2["HOVER"] = 4] = "HOVER";
  EventType2[EventType2["INTERSECT"] = 5] = "INTERSECT";
  EventType2[EventType2["PROXIMITY"] = 6] = "PROXIMITY";
  EventType2[EventType2["PRELOAD"] = 7] = "PRELOAD";
  EventType2[EventType2["REVERSE"] = 8] = "REVERSE";
  EventType2[EventType2["POPSTATE"] = 9] = "POPSTATE";
  EventType2[EventType2["RELOAD"] = 10] = "RELOAD";
  EventType2[EventType2["PREFETCH"] = 11] = "PREFETCH";
  EventType2[EventType2["CAPTURE"] = 12] = "CAPTURE";
  EventType2[EventType2["FETCH"] = 13] = "FETCH";
  return EventType2;
})(EventType || {});

function log(error, message) {
  if (error === Errors.INFO) {
    console.info("SPX: " + message);
  } else if (error === Errors.WARN) {
    console.warn("SPX: " + message);
  } else {
    console.error("SPX: " + message);
    try {
      if (error === Errors.TYPE) {
        throw new TypeError(message);
      } else {
        throw new Error(message);
      }
    } catch (e) {
    }
  }
}
function hasProp(object, property) {
  return property in object;
}
function uuid() {
  return Math.random().toString(36).slice(2);
}
function chunk(size2 = 2) {
  return (acc, value) => {
    const length = acc.length;
    const chunks = length < 1 || acc[length - 1].length === size2 ? acc.push([value]) : acc[length - 1].push(value);
    return chunks && acc;
  };
}
function size(bytes) {
  const kb = 1024;
  const mb = 1048576;
  const gb = 1073741824;
  if (bytes < kb)
    return bytes + " B";
  else if (bytes < mb)
    return (bytes / kb).toFixed(1) + " KB";
  else if (bytes < gb)
    return (bytes / mb).toFixed(1) + " MB";
  else
    return (bytes / gb).toFixed(1) + " GB";
}
function forEach(callback, array) {
  if (arguments.length === 1)
    return (array2) => forEach(callback, array2);
  const len = array.length;
  if (len === 0)
    return;
  for (let i = 0; i < len; i++)
    callback(array[i], i, array);
}
function empty(object) {
  for (const prop in object)
    delete object[prop];
}

function configure(options = {}) {
  if (hasProp(options, "hover")) {
    if (typeof options.hover !== "boolean")
      assign(config.hover, options.hover);
    else if (options.hover === false)
      config.hover = options.hover;
    delete options.hover;
  }
  if (hasProp(options, "intersect")) {
    if (typeof options.intersect !== "boolean")
      assign(config.intersect, options.intersect);
    else if (options.intersect === false)
      config.intersect = options.intersect;
    delete options.intersect;
  }
  if (hasProp(options, "proximity")) {
    if (typeof options.proximity !== "boolean")
      assign(config.proximity, options.proximity);
    else if (options.proximity === false)
      config.proximity = options.proximity;
    delete options.proximity;
  }
  if (hasProp(options, "progress")) {
    if (typeof options.progress !== "boolean")
      assign(config.progress, options.progress);
    else if (options.progress === false)
      config.progress = options.progress;
    delete options.progress;
  }
  if (hasProp(options, "session")) {
    if (options.session === "persist") {
      const record = localStorage.getItem("spx");
      if (record === null) {
        config.session = Math.floor(1e3 + Math.random() * 9e3).toString();
        localStorage.setItem("spx", config.session);
      } else {
        config.session = record;
      }
    }
    delete options.session;
  }
  const n = config.schema === null ? "data" : `data-${config.schema}`;
  const h = `:not([${n}-disable]):not([href^="#"])`;
  selectors.attrs = new RegExp("^href|" + n + "-(" + Attributes.NAMES + ")$", "i");
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
    selectors.hover = config.hover.trigger === "href" ? `a${h}:not([${n}-hover=false]):not([${n}-intersect]):not([${n}-proximity])` : `a[${n}-hover]${h}:not([${n}-hover=false]):not([${n}-intersect]):not([${n}-proximity])`;
  }
  assign(config, options);
  memory.bytes = 0;
  memory.limit = config.limit;
  memory.visits = 0;
}

const Protocol = /(?:https?:)?\/\/(?:www\.)?/;
const isPender = /\b(?:append|prepend)/;
const MimeType = /^(?:application|text)\/(?:x-)?(?:ecma|java)script|text\/javascript$/;
const isBoolean = /^\b(?:true|false)$/i;
const isNumber = /^[+-]?\d*\.?\d+$/;
const Whitespace = /\s+/g;
const isPrefetch = /\b(?:intersect|hover|proximity)\b/;
const ActionParams = /\[?[^,'"[\]()\s]+\]?/g;
const isArray = /\(?\[(['"]?.*['"]?,?)\]\)?/;
const isPosition = /[xy]:[0-9.]+/;
const inPosition = /[xy]|\d*\.?\d+/g;

const hostname = origin.replace(Protocol, nil);
function parseAttribute(attributes) {
  const state = object(null);
  forEach((current, index, source) => {
    const prop = source.length - 1 >= index ? index - 1 : index;
    if (index % 2)
      state[source[prop]] = isNumber.test(current) ? Number(current) : current;
  }, attributes);
  return state;
}
function getAttributes(element, page) {
  const state = page || object(null);
  for (const { nodeName, nodeValue } of element.attributes) {
    if (!selectors.attrs.test(nodeName))
      continue;
    if (nodeName === "href") {
      state.rev = location.pathname + location.search;
      if (!page) {
        state.location = getLocation(nodeValue);
        state.key = state.location.pathname + state.location.search;
      }
      continue;
    }
    const name = nodeName.slice(1 + nodeName.lastIndexOf("-"));
    const value = nodeValue.replace(Whitespace, nil);
    if (isArray.test(value)) {
      state[name] = isPender.test(name) ? value.match(ActionParams).reduce(chunk(2), []) : value.match(ActionParams);
    } else if (isPosition.test(value)) {
      state[name] = parseAttribute(value.match(inPosition));
    } else if (isBoolean.test(value)) {
      if (!isPrefetch.test(nodeName))
        state[name] = value === "true";
    } else if (isNumber.test(value)) {
      state[name] = Number(value);
    } else {
      state[name] = value;
    }
  }
  return state;
}
function parsePath(path) {
  const state = object(null);
  const hash = path.indexOf("#");
  if (hash >= 0) {
    state.hash = path.slice(hash);
    path = path.slice(0, hash);
  } else {
    state.hash = nil;
  }
  const params = path.indexOf("?");
  if (params >= 0) {
    state.search = path.slice(params);
    path = path.slice(0, params);
  } else {
    state.search = nil;
  }
  state.pathname = path;
  return state;
}
function getPath(url, proto) {
  const path = url.indexOf("/", proto);
  if (path > proto) {
    const hash = url.indexOf("#", path);
    return hash < 0 ? url.slice(path) : url.slice(path, hash);
  }
  const param = url.indexOf("?", proto);
  if (param > proto) {
    const hash = url.indexOf("#", param);
    return hash < 0 ? url.slice(param) : url.slice(param, hash);
  }
  return url.length - proto === hostname.length ? "/" : null;
}
function parseOrigin(url) {
  const path = url.startsWith("www.") ? url.slice(4) : url;
  const name = path.indexOf("/");
  if (name >= 0) {
    const key = path.slice(name);
    if (path.slice(0, name) === hostname)
      return key.length ? parsePath(key) : parsePath("/");
  } else {
    const char = path.search(/[?#]/);
    if (char >= 0) {
      if (path.slice(0, char) === hostname)
        return parsePath("/" + path.slice(char));
    } else {
      if (path === hostname)
        return parsePath("/");
    }
  }
  return null;
}
function hasOrigin(url) {
  if (url.startsWith("http"))
    return 1;
  if (url.startsWith("//"))
    return 2;
  if (url.startsWith("www."))
    return 3;
  return 0;
}
function validKey(url) {
  if (typeof url !== "string" || url.length === 0)
    return false;
  if (url.charCodeAt(0) === 47) {
    if (url.charCodeAt(1) !== 47)
      return true;
    if (url.startsWith("www.", 2))
      return url.startsWith(hostname, 6);
    return url.startsWith(hostname, 2);
  }
  if (url.charCodeAt(0) === 63)
    return true;
  if (url.startsWith("www."))
    return url.startsWith(hostname, 4);
  if (url.startsWith("http")) {
    const start = url.indexOf("/", 4) + 2;
    return url.startsWith("www.", start) ? url.startsWith(hostname, start + 4) : url.startsWith(hostname, start);
  }
}
function parseKey(url) {
  if (url.charCodeAt(0) === 47) {
    return url.charCodeAt(1) !== 47 ? parsePath(url) : parseOrigin(url.slice(2));
  }
  if (url.charCodeAt(0) === 63)
    return parsePath(location.pathname + url);
  if (url.startsWith("https:") || url.startsWith("http:")) {
    return parseOrigin(url.slice(url.indexOf("/", 4) + 2));
  }
  if (url.startsWith("www."))
    return parseOrigin(url);
  return null;
}
function getKey(link) {
  if (typeof link === "object")
    return link.pathname + link.search;
  const has = hasOrigin(link);
  if (has === 1) {
    const proto = link.charCodeAt(4) === 115 ? 8 : 7;
    const www = link.startsWith("www.", proto) ? proto + 4 : proto;
    return link.startsWith(hostname, www) ? getPath(link, www) : null;
  }
  if (has === 2) {
    const www = link.startsWith("www.", 2) ? 6 : 2;
    return link.startsWith(hostname, www) ? getPath(link, www) : null;
  }
  if (has === 3)
    return link.startsWith(hostname, 4) ? getPath(link, 4) : null;
  return link.startsWith(hostname, 0) ? getPath(link, 0) : null;
}
function getLocation(path) {
  const state = parseKey(path);
  state.origin = origin;
  state.hostname = hostname;
  return state;
}
function getRoute(link, type) {
  if (link instanceof Element) {
    const state2 = getAttributes(link);
    state2.type = type || EventType.VISIT;
    return state2;
  }
  const state = object(null);
  state.fwd = null;
  state.rev = location.pathname + location.search;
  state.location = getLocation(typeof link === "string" ? link : state.rev);
  state.key = getKey(state.location);
  state.type = type || EventType.VISIT;
  return state;
}

const parser = new DOMParser();
function parse(HTMLString) {
  return parser.parseFromString(HTMLString, "text/html");
}
function getTitle(dom) {
  const start = dom.indexOf(">", dom.indexOf("<title")) + 1;
  const end = dom.indexOf("</title", start);
  return dom.slice(start, end);
}

const events = object(null);
function emit(name, ...args) {
  const isCache = name === "store";
  if (isCache)
    args.splice(-1, 1, parse(args[args.length - 1]));
  let returns = true;
  forEach((argument) => {
    const returned = argument.apply(null, args);
    if (isCache) {
      if (returned instanceof Document) {
        returns = returned.documentElement.outerHTML;
      } else {
        if (typeof returns !== "string")
          returns = returned !== false;
      }
    } else {
      returns = returned !== false;
    }
  }, events[name] || []);
  return returns;
}
function on(name, callback) {
  if (!(name in events))
    events[name] = [];
  events[name].push(callback);
}
function off(name, callback) {
  const evts = events[name];
  const live = [];
  if (evts && callback) {
    let i = 0;
    const len = evts.length;
    for (; i < len; i++)
      if (evts[i] !== callback)
        live.push(evts[i]);
  }
  if (live.length)
    events[name] = live;
  else
    delete events[name];
  return this;
}

function purge(key = []) {
  const keys = isArray$1(key) ? key : [key];
  for (const p in pages) {
    const index = keys.indexOf(p);
    if (index >= 0) {
      delete snapshots[pages[p].uuid];
      delete pages[p];
      keys.splice(index, 1);
    }
  }
}
function clear$1(key) {
  if (!key) {
    empty(pages);
    empty(snapshots);
  } else if (typeof key === "string") {
    delete snapshots[pages[key].uuid];
    delete pages[key];
  } else if (isArray$1(key)) {
    forEach((url) => {
      delete pages[url];
      delete snapshots[pages[url].uuid];
    }, key);
  }
}
function create(page) {
  page.replace = hasProp(page, "replace") ? [].concat(config.targets, page.replace) : config.targets;
  if (config.cache) {
    if (!hasProp(page, "cache"))
      page.cache = config.cache;
    if (!hasProp(page, "uuid"))
      page.uuid = uuid();
  }
  if (!hasProp(page, "position")) {
    page.position = object(null);
    page.position.y = 0;
    page.position.x = 0;
  }
  if (config.hover !== false && page.type === EventType.HOVER) {
    if (!hasProp(page, "threshold"))
      page.threshold = config.hover.threshold;
  }
  if (config.proximity !== false && page.type === EventType.PROXIMITY) {
    if (!hasProp(page, "proximity"))
      page.proximity = config.proximity.distance;
    if (!hasProp(page, "threshold"))
      page.threshold = config.proximity.threshold;
  }
  if (config.progress !== false && !hasProp(page, "progress")) {
    page.progress = config.progress.threshold;
  }
  if (!hasProp(page, "visits"))
    page.visits = 0;
  const state = pages[page.key] = page;
  return state;
}
function set(state, snapshot) {
  console.log(state);
  const event = emit("store", state, snapshot);
  const dom = typeof event === "string" ? event : snapshot;
  if (state.type > 3 && state.type < 7)
    state.type = EventType.PREFETCH;
  state.title = getTitle(dom);
  if (!config.cache || event === false)
    return state;
  pages[state.key] = state;
  snapshots[state.uuid] = dom;
  emit("cached", state);
  return state;
}
function update$2(page, snapshot) {
  const state = hasProp(pages, page.key) ? pages[page.key] : create(page);
  if (typeof snapshot === "string") {
    snapshots[page.uuid] = snapshot;
    page.title = getTitle(snapshot);
  }
  return assign(state, page);
}
function get(key = history.state.key) {
  if (hasProp(pages, key)) {
    const state = object(null);
    state.page = pages[key];
    state.dom = parse(snapshots[state.page.uuid]);
    return state;
  }
  log(Errors.ERROR, `No record exists: ${key}`);
}
function has(key) {
  return hasProp(pages, key) && hasProp(pages[key], "uuid") && hasProp(snapshots, pages[key].uuid);
}

// ../../node_modules/.pnpm/detect-it@4.0.1/node_modules/detect-it/dist/detect-it.esm.js
var w = typeof window !== "undefined" ? window : { screen: {}, navigator: {} };
var matchMedia = (w.matchMedia || function() {
  return { matches: false };
}).bind(w);
var options = {
  get passive() {
    return true;
  }
};
var noop = function() {
};
w.addEventListener && w.addEventListener("p", noop, options);
w.removeEventListener && w.removeEventListener("p", noop, false);
var supportsPointerEvents = "PointerEvent" in w;
var onTouchStartInWindow = "ontouchstart" in w;
var touchEventInWindow = "TouchEvent" in w;
var supportsTouchEvents = onTouchStartInWindow || touchEventInWindow && matchMedia("(any-pointer: coarse)").matches;
(w.navigator.maxTouchPoints || 0) > 0 || supportsTouchEvents;
var userAgent = w.navigator.userAgent || "";
var isIPad = matchMedia("(pointer: coarse)").matches && /iPad|Macintosh/.test(userAgent) && Math.min(w.screen.width || 0, w.screen.height || 0) >= 768;
(matchMedia("(pointer: coarse)").matches || !matchMedia("(pointer: fine)").matches && onTouchStartInWindow) && !/Windows.*Firefox/.test(userAgent);
matchMedia("(any-pointer: fine)").matches || matchMedia("(any-hover: hover)").matches || isIPad || !onTouchStartInWindow;

function getLink(target, selector) {
  if (!(target instanceof Element))
    return false;
  const element = target.closest(selector);
  return element && element.tagName === "A" ? element : false;
}
function canFetch(target) {
  if (target.nodeName !== "A")
    return false;
  const href = target.href;
  if (!validKey(href))
    return false;
  return !has(getKey(href));
}
function getNodeTargets(selector, hrefs) {
  return toArray(document.body.querySelectorAll(selector)).flatMap((node) => {
    return node.nodeName !== "A" ? toArray(node.querySelectorAll(hrefs)).filter(canFetch) : canFetch(node) ? node : [];
  });
}
const getTargets = (selector) => {
  return toArray(document.body.querySelectorAll(selector)).filter(canFetch);
};

var __async$5 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const transit = object(null);
const timers = object(null);
const xhr = object(null);
function request(key) {
  const request2 = xhr[key] = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    request2.open("GET", key, config.async);
    request2.setRequestHeader("X-SPX", "true");
    request2.setRequestHeader("X-SPX-Session", "true");
    request2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    request2.onload = function() {
      resolve(request2.responseText);
    };
    request2.onloadend = function(event) {
      memory.bytes = memory.bytes + event.loaded;
      memory.visits = memory.visits + 1;
      delete xhr[key];
    };
    request2.onerror = function() {
      reject(this.statusText);
    };
    request2.onabort = function() {
      delete xhr[key];
    };
    request2.send(null);
  });
}
function throttle(key, callback, delay) {
  if (hasProp(timers, key))
    return;
  if (!has(key))
    timers[key] = setTimeout(callback, delay);
}
function cleanup(key) {
  if (!hasProp(timers, key))
    return true;
  clearTimeout(timers[key]);
  return delete timers[key];
}
function cancel(key) {
  if (hasProp(xhr, key)) {
    for (const url in xhr) {
      if (key === url)
        continue;
      console.log("cancel", key);
      xhr[url].abort();
      log(Errors.WARN, `Pending fetch aborted: ${url}`);
    }
  }
}
function preload(state) {
  if (config.preload !== null) {
    if (isArray$1(config.preload)) {
      return Promise.all(config.preload.filter((path) => {
        const route = getRoute(path, EventType.PRELOAD);
        return route.key !== path ? fetch$1(create(route)) : false;
      }));
    } else if (typeof config.preload === "object") {
      if (hasProp(config.preload, state.key)) {
        return Promise.all(config.preload[state.key].map((path) => fetch$1(create(getRoute(path, EventType.PRELOAD)))));
      }
    }
  }
}
function reverse$1(key) {
  if (has(key))
    return;
  console.log("REVERSE FETCH FOR", key);
  const route = getRoute(key, EventType.REVERSE);
  const page = create(route);
  fetch$1(page);
}
function wait(state) {
  return __async$5(this, null, function* () {
    if (!hasProp(transit, state.key))
      return Promise.resolve(state);
    const snapshot = yield transit[state.key];
    return set(state, snapshot);
  });
}
function fetch$1(state) {
  if (hasProp(xhr, state.key)) {
    if (state.type === EventType.REVERSE) {
      if (hasProp(xhr, state.rev))
        xhr[state.rev].abort();
      log(Errors.WARN, `Reverse fetch aborted: ${state.key}`);
    } else {
      log(Errors.WARN, `Fetch already in transit: ${state.key}`);
    }
    return Promise.resolve(false);
  }
  if (!emit("fetch", state)) {
    log(Errors.WARN, `Fetch cancelled within dispatched event: ${state.key}`);
    return Promise.resolve(false);
  }
  transit[state.key] = request(state.key);
  return wait(state);
}

function onMouseLeave(event) {
  const target = getLink(event.target, selectors.hover);
  if (target) {
    cleanup(getKey(target.href));
    handleHover(target);
  }
}
function onMouseEnter(event) {
  const target = getLink(event.target, selectors.hover);
  if (!target)
    return;
  const route = getRoute(target, EventType.HOVER);
  if (hasProp(timers, route.key))
    return;
  if (has(route.key))
    return removeListener(target);
  handleLeave(target);
  const state = create(route);
  const delay = state.threshold || config.hover.threshold;
  throttle(route.key, function() {
    if (!emit("prefetch", target, route))
      return removeListener(target);
    fetch$1(state).then(function(prefetch) {
      return prefetch ? removeListener(target) : null;
    });
  }, delay);
}
function handleHover(target) {
  if (supportsPointerEvents) {
    target.addEventListener("pointerenter", onMouseEnter, false);
  } else {
    target.addEventListener("mouseenter", onMouseEnter, false);
  }
}
function handleLeave(target) {
  if (supportsPointerEvents) {
    target.addEventListener("pointerout", onMouseLeave, false);
    target.removeEventListener("pointerenter", onMouseEnter, false);
  } else {
    target.addEventListener("mouseleave", onMouseLeave, false);
    target.removeEventListener("mouseenter", onMouseEnter, false);
  }
}
function removeListener(target) {
  if (supportsPointerEvents) {
    target.removeEventListener("pointerenter", onMouseEnter, false);
    target.removeEventListener("pointerout", onMouseLeave, false);
  } else {
    target.removeEventListener("mouseleave", onMouseLeave, false);
    target.removeEventListener("mouseenter", onMouseEnter, false);
  }
}
function connect$6() {
  if (!config.hover || observers.hover)
    return;
  forEach(handleHover, getTargets(selectors.hover));
  observers.hover = true;
}
function disconnect$6() {
  if (!observers.hover)
    return;
  forEach(removeListener, getTargets(selectors.hover));
  observers.hover = false;
}

function inRange({ clientX, clientY }, bounds) {
  return clientX <= bounds.right && clientX >= bounds.left && clientY <= bounds.bottom && clientY >= bounds.top;
}
function setBounds(target) {
  const state = object(null);
  const rect = target.getBoundingClientRect();
  const attr = target.getAttribute(`${config.schema}-proximity`);
  const distance = isNumber.test(attr) ? Number(attr) : config.proximity.distance;
  state.target = target;
  state.top = rect.top - distance;
  state.bottom = rect.bottom + distance;
  state.left = rect.left - distance;
  state.right = rect.right + distance;
  return state;
}
function observer(targets) {
  let wait = false;
  return (event) => {
    if (wait)
      return;
    wait = true;
    const node = targets.findIndex((node2) => inRange(event, node2));
    if (node === -1) {
      setTimeout(() => {
        wait = false;
      }, config.proximity.throttle);
    } else {
      const { target } = targets[node];
      const page = create(getRoute(target, EventType.PROXIMITY));
      const delay = page.threshold || config.proximity.threshold;
      throttle(page.key, () => {
        if (!emit("prefetch", target, page))
          return disconnect$5();
        return fetch$1(page).then((prefetch) => {
          if (prefetch) {
            targets.splice(node, 1);
            wait = false;
            if (targets.length === 0) {
              disconnect$5();
              log(Errors.INFO, "Proximity observer disconnected");
            }
          }
        });
      }, delay);
    }
  };
}
let entries$1;
function connect$5() {
  if (!config.proximity || observers.proximity)
    return;
  const targets = getTargets(selectors.proximity).map(setBounds);
  if (targets.length > 0) {
    entries$1 = observer(targets);
    if (supportsPointerEvents) {
      addEventListener("pointermove", entries$1, false);
    } else {
      addEventListener("mousemove", entries$1, false);
    }
    observers.proximity = true;
  }
}
function disconnect$5() {
  if (!observers.proximity)
    return;
  if (supportsPointerEvents) {
    removeEventListener("pointermove", entries$1, false);
  } else {
    removeEventListener("mousemove", entries$1, false);
  }
  observers.proximity = false;
}

var __async$4 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
let entries;
function onIntersect(entry) {
  return __async$4(this, null, function* () {
    if (entry.isIntersecting) {
      const route = getRoute(entry.target, EventType.INTERSECT);
      if (!emit("prefetch", entry.target, route))
        return entries.unobserve(entry.target);
      const response = yield fetch$1(create(route));
      if (response) {
        entries.unobserve(entry.target);
      } else {
        log(Errors.WARN, `Prefetch will retry at next intersect for: ${route.key}`);
        entries.observe(entry.target);
      }
    }
  });
}
function connect$4() {
  if (!config.intersect || observers.intersect)
    return;
  if (!entries)
    entries = new IntersectionObserver(forEach(onIntersect), config.intersect);
  forEach((n) => entries.observe(n), getNodeTargets(selectors.intersect, selectors.interHref));
  observers.intersect = true;
}
function disconnect$4() {
  if (!observers.intersect)
    return;
  entries.disconnect();
  observers.intersect = false;
}

let status = null;
let timeout$1;
let element = null;
const pending = [];
function setProgress(n) {
  const { speed, easing, minimum } = config.progress;
  const started = typeof status === "number";
  n = clamp(n, minimum, 1);
  status = n === 1 ? null : n;
  const progress = render(!started);
  progress.offsetWidth;
  queue((next) => {
    progress.style.transform = `translate3d(${percentage(n)}%,0,0)`;
    progress.style.transition = `all ${speed}ms ${easing}`;
    if (n !== 1)
      return setTimeout(next, speed);
    progress.style.transition = "none";
    progress.style.opacity = "1";
    progress.offsetWidth;
    setTimeout(() => {
      progress.style.transition = `all ${speed}ms ${easing}`;
      progress.style.opacity = "0";
      setTimeout(() => [remove(), next()], speed);
    }, speed);
  });
}
function increment(amount) {
  let n = status;
  if (!n)
    return start();
  if (n < 1) {
    if (typeof amount !== "number") {
      if (n >= 0 && n < 0.2)
        amount = 0.1;
      else if (n >= 0.2 && n < 0.5)
        amount = 0.04;
      else if (n >= 0.5 && n < 0.8)
        amount = 0.02;
      else if (n >= 0.8 && n < 0.99)
        amount = 5e-3;
      else
        amount = 0;
    }
    n = clamp(n + amount, 0, 0.994);
    return setProgress(n);
  }
}
function render(fromStart) {
  if (element)
    return element;
  document.documentElement.classList.add("spx-load");
  const percent = fromStart ? "-100" : percentage(status || 0);
  const progress = document.createElement("div");
  progress.id = "spx-progress";
  progress.style.pointerEvents = "none";
  progress.style.background = config.progress.background;
  progress.style.height = config.progress.height;
  progress.style.position = "fixed";
  progress.style.zIndex = "9999";
  progress.style.top = "0";
  progress.style.left = "0";
  progress.style.width = "100%";
  progress.style.transition = "all 0 linear";
  progress.style.transform = `translate3d(${percent}%,0,0)`;
  document.body.appendChild(progress);
  element = progress;
  return progress;
}
function remove() {
  document.documentElement.classList.remove("spx-load");
  const progress = document.getElementById("spx-progress");
  progress && document.body.removeChild(element);
  element = null;
}
function clamp(n, min, max) {
  if (n < min)
    return min;
  if (n > max)
    return max;
  return n;
}
function percentage(n) {
  return (-1 + n) * 100;
}
function queue(fn) {
  const next = () => {
    const fn2 = pending.shift();
    if (fn2)
      fn2(next);
  };
  pending.push(fn);
  if (pending.length === 1)
    next();
}
function start(threshold) {
  if (!config.progress)
    return;
  timeout$1 = setTimeout(function() {
    if (!status)
      setProgress(0);
    const work = function() {
      setTimeout(() => {
        if (!status)
          return;
        increment();
        work();
      }, config.progress.trickleSpeed);
    };
    if (config.progress.trickle)
      work();
  }, threshold || 0);
}
function done(force) {
  clearTimeout(timeout$1);
  if (!force && !status)
    return;
  increment(0.3 + 0.5 * Math.random());
  return setProgress(1);
}

var __async$3 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function evaluator(exec) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.addEventListener("error", reject);
    script.async = false;
    script.text = exec.target.text;
    for (const { nodeName, nodeValue } of exec.target.attributes) {
      script.setAttribute(nodeName, nodeValue);
    }
    if (document.contains(exec.target)) {
      exec.target.replaceWith(script);
    } else {
      document.head.append(script);
      exec.external ? script.addEventListener("load", () => script.remove()) : script.remove();
    }
    exec.external ? script.addEventListener("load", () => resolve()) : resolve();
  });
}
function scriptTag(tag) {
  if (!tag.hasAttribute("src") && !tag.text)
    return;
  const mime = tag.type ? tag.type.trim().toLowerCase() : "text/javascript";
  const type = MimeType.test(mime) ? 1 : mime === "module" ? 2 : NaN;
  const exec = object(null);
  exec.blocking = true;
  exec.evaluate = false;
  exec.external = false;
  if (isNaN(type) || tag.noModule && type === 1)
    return exec;
  if (tag.src)
    exec.external = true;
  if (type !== 1 || exec.external && (tag.hasAttribute("async") || tag.defer))
    exec.blocking = false;
  exec.evaluate = true;
  exec.target = tag;
  return exec;
}
function execute(script) {
  return __async$3(this, null, function* () {
    try {
      const evaluate = evaluator(script);
      if (script.blocking)
        yield evaluate;
    } catch (e) {
      console.error(e);
    }
  });
}
function evaljs(scripts) {
  return __async$3(this, null, function* () {
    const scriptjs = toArray(scripts, scriptTag).filter((script) => script.evaluate);
    const executed = scriptjs.reduce((promise, script) => __async$3(this, null, function* () {
      if (script.external)
        return Promise.all([promise, execute(script)]);
      yield promise;
      const exec = yield execute(script);
      return exec;
    }), Promise.resolve());
    yield Promise.race([executed]);
  });
}

const pos = object(null);
let ticking = false;
function position() {
  console.log(pos);
  return pos;
}
function scroll() {
  pos.y = window.scrollY;
  pos.x = window.scrollX;
  if (!ticking) {
    requestAnimationFrame(position);
    ticking = true;
  }
}
function reset() {
  ticking = false;
  pos.x = 0;
  pos.y = 0;
  return pos;
}
function connect$3() {
  if (observers.scroll)
    return;
  addEventListener("scroll", scroll, { passive: true });
  observers.scroll = true;
}
function disconnect$3() {
  if (!observers.scroll)
    return;
  removeEventListener("scroll", onscroll, false);
  reset();
  observers.scroll = false;
}

var __async$2 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function nodePosition(a, b) {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING || -1;
}
function scriptNodes(target) {
  return __async$2(this, null, function* () {
    const scripts = toArray(target.querySelectorAll(selectors.script));
    scripts.sort(nodePosition);
    yield evaljs(scripts);
  });
}
function trackedNodes(target) {
  target.querySelectorAll(selectors.track).forEach((node) => {
    if (!node.hasAttribute("id"))
      return;
    if (!tracked.has(node.id)) {
      document.body.appendChild(node);
      tracked.add(node.id);
    }
  });
}
function renderNodes(page, target) {
  const nodes = page.replace;
  if (nodes.length === 1 && nodes[0] === "body")
    return document.body.replaceWith(target.body);
  const selector = nodes.join(",");
  const current = document.body.querySelectorAll(selector);
  const fetched = target.body.querySelectorAll(selector);
  current.forEach((node, i) => {
    if (!node.matches(nodes[i]))
      return;
    if (!emit("render", node, fetched[i]))
      return;
    node.replaceWith(fetched[i]);
    if (page.append || page.prepend) {
      const fragment = document.createElement("div");
      target.childNodes.forEach(fragment.appendChild);
      return page.append ? node.appendChild(fragment) : node.insertBefore(fragment, node.firstChild);
    }
  });
  trackedNodes(target.body);
}
function hydrateNodes(state, target) {
  const nodes = state.hydrate.join(",");
  const current = document.body.querySelectorAll(nodes);
  if (current.length > 0) {
    const fetched = target.body.querySelectorAll(nodes);
    current.forEach((node, i) => {
      if (!fetched[i])
        return;
      if (!emit("hydrate", node, fetched[i]))
        return;
      if (node.firstChild.nodeType === Node.TEXT_NODE) {
        node.innerHTML = fetched[i].innerHTML;
      } else {
        node.replaceWith(fetched[i]);
      }
    });
  }
  state.type = EventType.VISIT;
  update$2(state);
  purge(state.key);
}
function update$1(page) {
  disconnect$6();
  disconnect$4();
  disconnect$5();
  const target = parse(snapshots[page.uuid]);
  if (page.type === EventType.HYDRATE) {
    hydrateNodes(page, target);
  } else {
    renderNodes(page, target);
    scrollTo(page.position.x, page.position.y);
  }
  scriptNodes(target.head);
  done();
  reset();
  connect$6();
  connect$4();
  connect$5();
  emit("load", page);
  return page;
}

var __async$1 = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function stack(page) {
  const state = object(null);
  state.key = page.key;
  state.rev = page.rev;
  state.title = page.title;
  state.uuid = page.uuid;
  state.cache = page.cache;
  state.replace = page.replace;
  state.type = page.type;
  state.progress = page.progress;
  state.position = reset();
  return state;
}
function load() {
  return document.readyState === "complete";
}
function reverse() {
  return history.state !== null && hasProp(history.state, "rev") && history.state.key !== history.state.rev;
}
function replace(state) {
  console.log("REPLACE", state);
  history.replaceState(stack(state), state.title, state.key);
  return state;
}
function push(state) {
  console.log("PUSH STATE", state);
  history.pushState(stack(state), state.title, state.key);
  return state;
}
let timeout;
function pop(event, retry) {
  if (!load())
    return;
  const { state } = event;
  clearInterval(timeout);
  if (has(state.key)) {
    reverse$1(state.rev);
    return update$1(pages[state.key]);
  }
  timeout = setTimeout(function() {
    return __async$1(this, null, function* () {
      state.type = EventType.POPSTATE;
      const page = yield fetch$1(state);
      if (!page)
        return location.assign(state.key);
      const key = getKey(location);
      if (page.key === key)
        return update$1(page);
      if (has(key))
        return update$1(pages[key]);
      const data = create(getRoute(key, EventType.POPSTATE));
      fetch$1(data);
      history.replaceState(data, document.title, key);
    });
  }, 300);
}
function connect$2() {
  if (observers.history)
    return;
  addEventListener("popstate", pop, false);
  addEventListener("load", load, false);
  observers.history = true;
}
function disconnect$2() {
  if (!observers.history)
    return;
  removeEventListener("popstate", pop, false);
  addEventListener("load", load, false);
  observers.history = false;
}

function linkEvent(event) {
  return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
}
function handleTrigger(event) {
  if (!linkEvent(event))
    return;
  const target = getLink(event.target, selectors.href);
  if (!target)
    return;
  const key = getKey(target.href);
  if (key === null)
    return;
  disconnect$6();
  disconnect$5();
  disconnect$4();
  if (!emit("visit", event))
    return;
  if (hasProp(transit, key)) {
    const page = pages[key];
    cancel(key);
    target.addEventListener("click", function handle(event2) {
      event2.preventDefault();
      target.removeEventListener("click", handle, false);
      return visit$1(page);
    }, false);
  } else if (has(key)) {
    const attrs = getAttributes(target, pages[key]);
    const page = update$2(attrs);
    target.addEventListener("click", function handle(event2) {
      event2.preventDefault();
      target.removeEventListener("click", handle, false);
      return update$1(page);
    }, false);
  } else {
    cancel();
    const route = getRoute(target, EventType.VISIT);
    const page = create(route);
    fetch$1(page);
    target.addEventListener("click", function handle(event2) {
      event2.preventDefault();
      target.removeEventListener("click", handle, false);
      return visit$1(page);
    }, false);
  }
}
function visit$1(state) {
  start(state.progress);
  wait(state).then(function(page) {
    if (page) {
      push(page);
      update$1(page);
    } else {
      location.assign(state.key);
    }
  }).catch(function(error) {
    location.assign(state.key);
    log(Errors.ERROR, error);
  });
}
function navigate(key, state) {
  if (state) {
    if (typeof state.cache === "string")
      state.cache === "clear" ? clear$1() : clear$1(state.key);
    start(state.progress);
    fetch$1(state).then(function(page) {
      return page ? update$1(page) : location.assign(state.key);
    });
  } else {
    return visit$1(pages[key]);
  }
}
function connect$1() {
  if (observers.hrefs)
    return;
  if (supportsPointerEvents) {
    addEventListener("pointerdown", handleTrigger, false);
  } else {
    addEventListener("mousedown", handleTrigger, false);
    addEventListener("touchstart", handleTrigger, false);
  }
  observers.hrefs = true;
}
function disconnect$1() {
  if (!observers.hrefs)
    return;
  if (supportsPointerEvents) {
    removeEventListener("pointerdown", handleTrigger, false);
  } else {
    removeEventListener("mousedown", handleTrigger, false);
    removeEventListener("touchstart", handleTrigger, false);
  }
  observers.hrefs = false;
}

function onload() {
  const state = create(getRoute(EventType.INITIAL));
  const page = set(state, document.documentElement.outerHTML);
  if (reverse())
    page.rev = history.state.rev;
  page.position = position();
  emit("connected", page);
  replace(page);
  reverse$1(page.rev);
  preload(page);
  removeEventListener("load", onload);
}
function initialize() {
  connect$3();
  connect$2();
  connect$1();
  connect$6();
  connect$4();
  connect$5();
  addEventListener("load", onload);
  log(Errors.INFO, "Connection Established \u26A1");
}
function destroy() {
  disconnect$3();
  disconnect$2();
  disconnect$1();
  disconnect$6();
  disconnect$4();
  disconnect$5();
  clear$1();
  log(Errors.INFO, "Disconnected \u{1F614}");
}

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const supported = !!(history.pushState && window.requestAnimationFrame && window.addEventListener && window.DOMParser);
function connect(options = {}) {
  configure(options);
  if (supported) {
    if (/https?/.test(window.location.protocol)) {
      addEventListener("DOMContentLoaded", initialize);
    } else {
      log(Errors.ERROR, "Invalid protocol, SPX expects https or http protocol");
    }
  } else {
    log(Errors.ERROR, "Browser is not supported");
  }
}
function session(key, update2) {
  if (key) {
    if (update2) {
      if (key === "config")
        configure(update2);
      if (key === "observers")
        assign(observers, update2);
    } else {
      if (key === "config")
        return config;
      if (key === "observers")
        return observers;
      if (key === "pages")
        return pages;
      if (key === "snapshots")
        return snapshots;
      if (key === "memory")
        return size(memory.bytes);
    }
  }
  const state2 = object(null);
  state2.config = config;
  state2.snapshots = snapshots;
  state2.pages = pages;
  state2.selectors = selectors;
  state2.observers = observers;
  state2.memory = memory;
  state2.memory.size = size(state2.memory.bytes);
  return state2;
}
function state(key, update2) {
  return __async(this, null, function* () {
    if (key === void 0)
      return get();
    if (typeof key === "string") {
      const k = getKey(key);
      if (!has(k))
        log(Errors.ERROR, `No store exists at: ${k}`);
      const record = get(k);
      return update2 !== void 0 ? update$2(assign(record.page, update2)) : record;
    }
    if (typeof key === "object")
      return update$2(key);
  });
}
function reload(options) {
  return __async(this, null, function* () {
    const state2 = pages[history.state.key];
    if (options)
      assign(state2, options);
    state2.type = EventType.RELOAD;
    const page = yield fetch$1(state2);
    if (page) {
      log(Errors.INFO, "Triggered reload, page was re-cached");
      return update$1(page);
    }
    log(Errors.WARN, "Reload failed, triggering refresh (cache will be purged)");
    return location.assign(state2.key);
  });
}
function fetch(url) {
  return __async(this, null, function* () {
    const link = getRoute(url, EventType.FETCH);
    if (link.location.origin !== origin) {
      log(Errors.ERROR, "Cross origin fetches are not allowed");
    }
    const response = yield request(link.key);
    if (response)
      return parse(response);
  });
}
function clear(url) {
  return clear$1(url);
}
function update(elements) {
  return __async(this, null, function* () {
  });
}
function hydrate(link, elements) {
  return __async(this, null, function* () {
    const route = getRoute(EventType.HYDRATE);
    route.position = position();
    route.hydrate = elements;
    const dom = yield request(link);
    if (!dom)
      return log(Errors.WARN, "Hydration fetch failed");
    const page = has(route.key) ? update$2(route, dom) : create(route);
    reverse$1(route.rev);
    return update$1(page);
  });
}
function prefetch(link) {
  return __async(this, null, function* () {
    const path = getRoute(link, EventType.PREFETCH);
    if (has(path.key)) {
      log(Errors.WARN, `Cache already exists for ${path.key}, prefetch skipped`);
      return;
    }
    const prefetch2 = yield fetch$1(create(path));
    if (prefetch2)
      return prefetch2;
    log(Errors.ERROR, `Prefetch failed for ${path.key}`);
  });
}
function visit(link, options) {
  return __async(this, null, function* () {
    const route = getRoute(link);
    const merge = typeof options === "object" ? assign(route, options) : route;
    return has(route.key) ? navigate(route.key, update$2(merge)) : navigate(route.key, create(merge));
  });
}
function disconnect() {
  destroy();
}

export { clear, connect, disconnect, fetch, hydrate, off, on, prefetch, reload, session, state, supported, update, visit };
