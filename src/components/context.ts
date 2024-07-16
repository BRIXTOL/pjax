import type { ComponentBinds, ComponentEvent, ComponentNodes, Scope } from 'types';
import { $ } from '../app/session';
import { Hooks, LogType } from '../shared/enums';
import { d, o } from '../shared/native';
import { log } from '../shared/logs';
import { walkElements } from '../morph/walk';
import { setInstances } from './instances';
import * as u from '../shared/utils';
import * as fragment from '../observe/fragment';
import { snap } from './snapshot';

/*
  SPX COMPONENT - ALGORITHM

  The components algorithm is a series of functions which execute top > down. There are 2 different traversal
  operations for components in SPX. The first one is the intialization traversal, this occurs at runtime and
  involves walking the DOM. The second operation is an incremental traversal which occurs during morphs. The
  initialization operation executes only once, whereas the incremental traversal occurs for each visit.

  DATASET REFERENCES

  Component elements (dom, events, binds and nodes) will be annotated with a data-spx="" value. The value is
  is mapped to instances. Each time we encounter an element of interest (component directive) we mark it with
  an UUID reference via the data-spx="" attribute. The UUID value within that attribute use the following pattern:

  c.a1b2c3  - Components begin with "c"
  b.fw32dk  - Binds begin with "b"
  e.tudhj2  - Events begin with "e"
  n.xcnd34  - Nodes begins with "n"

  In situations where an element is annotated with multiple directives, for example:

  BEFORE:
    <div
      spx@mouseover="ref.callback"
      spx-node="ref.id"
    ></div>

  AFTER:
    <div
      spx@mouseover="ref.callback"
      spx-node="ref.id"
      data-spx="e.tudhj2,n.xcnd34"  << Internal Reference
    ></div>

  Notice in the AFTER example, the data-spx="" value has comma separated UUID refs. The values UUIDs are important
  because these will determine elements of interest during morph operations and will leveraged to acquire the related instances(see observe.ts).

  CONTEXT > INSTANCE > SCOPE

  The functions on this page are responsible for composing context. Context is represented as a simple data-model
  and it is exposed on a read-only property of components using the name "scope". The scope is what we refer to
  when manipulating components on a per-page basis. Consult the type JSDoc descriptions for more information there.

  SNAPSHOTS

  It's important to note that the algorithm updates snapshots in the cache. This ensure that subsequent visits
  can re-connect events and updates nodes in the most effecient manner possible, without having to walk the
  entire tree. We use data-spx attributes specifically because our snapshots are DOM strings which we active with
  DOM Parser when visiting new pages. The reference allow us to persist across visits in the session.

*/

export interface Context {
  /**
   * Alias Maps
   */
  $aliases: { [alias: string]: string; };
  /**
   * Component Scopes
   */
  $scopes: { [component: string]: Scope[]; };
  /**
   * When we are applying incremental context generation (i.e: during morphs)
   * this value will be `true`, otherwise `false`.
   *
   * @default false
   */
  $morph: HTMLElement;
  /**
   * Holds a reference to the snapshot, used for creating data-spx="" references
   *
   * @default false
   */
  $snapshot: HTMLElement;
  /**
   * Holds a reference to the last known element identifier
   *
   * @default null
   */
  $element: string;
  /**
   * Holds a reference to the last known element identifier
   *
   * @default null
   */
  $snaps: string;
}

/* -------------------------------------------- */
/* DOM WALKS                                    */
/* -------------------------------------------- */

/**
 * Get InstanceOf
 *
 * Normalizes the `spx-component` attribute value and corrects possible malformed
 * identifiers. This `spx-component` attribute can accept multiple component references,
 * this function ensure we can read each entry.
 */
export function getComponentValues (input: string) {

  return input
    .trim()
    .replace(/\s+/, ' ')
    .split(/[|, ]/)
    .map(u.camelCase);

}

/**
 * Get Event Attrs
 *
 * Event parameter syntacticals provided on elements annotated with
 * event directives. this function will obtain the parameter name and values.
 */
export function getEventParams (attributes: NamedNodeMap, event: ComponentEvent) {

  for (let i = 0, s = attributes.length; i < s; i++) {

    const { name, value } = attributes[i];

    // Ensure we are not dealing with an "spx-data:" attribute
    if (!$.qs.$param.test(name) || name.startsWith($.qs.$data) || !value) continue;

    const prop = name
      .slice($.config.schema.length)
      .split(':')
      .pop();

    if (event.params === null) event.params = o();

    if (!(prop in event.params)) event.params[prop] = u.attrValueFromType(value);

  }

}

/**
 * Is Directive
 *
 * Similar to `isDirectiveLike` but instead validates to ensure the
 * passed in parameter value actually contains a component directive.
 */
export function isDirective (attrs: string | NamedNodeMap) {

  if (typeof attrs === 'string') {
    return (
      attrs.indexOf('@') > -1 ||
      attrs === $.qs.$component ||
      attrs === $.qs.$node ||
      attrs === $.qs.$bind
    );
  }

  for (let i = attrs.length - 1; i >= 0; i--) if (isDirective(attrs[i].name)) return true;

  return false;

}

export function walkNode (
  node: HTMLElement,
  context: Context
): false | Context | void {

  // Quick check before proceeding to help prevent unnecessary inspection
  //
  if (!isDirective(node.attributes)) return;

  // The node is not "spx-component" but may be component related.
  // We will pass this to setAttrs for futher analysis to determine if
  // the node itself is of interest to us, see the setAttrs logic.
  //
  if (node.hasAttribute($.qs.$component)) {
    setComponent(node, node.getAttribute($.qs.$component), context);
  } else {
    setAttrs(node, context, null, null);
  }

}

/* -------------------------------------------- */
/* GETTERS                                      */
/* -------------------------------------------- */

/**
 * Get Context
 *
 * Returns a context model. This object is used collect and gather information
 * about nodes contained within the DOM that are component related. We will used
 * this to establish instances.
 */
export function getContext (
  $morph: HTMLElement = null,
  $snapshot: HTMLElement = null
): Context {

  return o<Context>({
    $aliases: o(),
    $scopes: o(),
    $element: null,
    $morph,
    $snapshot,
    $snaps: $morph ? o() : null
  });

}

/**
 * Get Selector
 *
 * Returns a valid selector string for querying snapshot elements.
 */
export function getSelector (
  node: HTMLElement,
  attrName: string,
  attrValue?: string,
  contains?: boolean
) {

  if (!attrValue) attrValue = node.getAttribute(attrName);

  return `${node.nodeName.toLowerCase()}[${attrName}${contains ? '*=' : '='}"${attrValue}"]`;

}

/**
 * Get Scope
 *
 * Returns the last known component scope reference established.
 * This function will also check aliases but is responsible for
 * obtaining scopes from aliases which follow a component instance.
 */
export function getScope (id: string, { $scopes, $aliases }: Context) {

  if (!(id in $scopes)) {
    if (id in $aliases) return u.last($scopes[$aliases[id]]);
    $scopes[id] = [ setScope(id) ];
    return $scopes[id][0];
  }

  return id in $aliases ? u.last($scopes[$aliases[id]]) : u.last($scopes[id]);

}

/* -------------------------------------------- */
/* SETTERS                                      */
/* -------------------------------------------- */

/**
 * Set DOM Ref
 *
 * This function is used to set `data-spx` internal reference identifiers
 * on valid elements in the DOM. DOM Refs are imperative and probably the
 * most important aspect to the algorithm.
 *
 * **NOTE**
 *
 * Once an element is marked, we will also add hint to the queue for updating
 * and aligning the snapshot record in cache. See {@link snap} closure function
 * for the handling of that operation. The `selector` parameter MUST be passed
 * in order for the ref to be queued for snapshot alignment.
 */
export function setDomRef (
  node: HTMLElement,
  instance: string,
  ref: string,
  selector?: string
) {

  $.components.$reference[ref] = instance;

  const value = node.getAttribute($.qs.$ref);
  const suffix = value ? `${value},${ref}` : ref;

  node.setAttribute($.qs.$ref, suffix);

  if (selector) snap.add(selector, ref);

  return ref;

}

/**
 * Set Scope
 *
 * This function is responsible for creating a component {@link Scope}.
 * The `scope` of a component contains instance establishment instructions.
 * Triggering this function is how we generate the scope model and parameter
 * existence of `dom` infers that we have encountered an `spx-component` element.
 *
 * All component related elements which no existing scope in {@link Context} will
 * pass through this function and a reference will be established. This operation
 * allows us to have scopes available whenever we encounter component related element.
 */
export function setScope (
  instanceOf: string,
  dom?: HTMLElement,
  context?: Context
): Scope {

  const { $registry } = $.components;
  const key = u.uuid();
  const scope: Scope = o<Partial<Scope>>({
    key,
    ref: `c.${key}`,
    status: Hooks.UNMOUNTED,
    connected: false,
    snapshot: null,
    snap: null,
    state: o(),
    nodes: o(),
    events: o(),
    binds: o()
  });

  // Whenever a dom parameter exists it infers an spx-component
  // annotated element was detected
  if (dom) {

    scope.dom = context.$element;
    scope.status = Hooks.MOUNT;
    scope.inFragment = fragment.contains(dom);
    scope.selector = getSelector(dom, $.qs.$component, instanceOf);
    scope.alias = dom.hasAttribute('id') ? u.camelCase(dom.id.trim()) : null;

    setDomRef(
      dom,
      key,
      scope.ref,
      scope.selector
    );
  }

  if ($registry.has(instanceOf)) {

    scope.instanceOf = instanceOf;

    if (scope.alias) {

      // Aliases cannot match components identifiers in register
      // When false, we can proceed with matching up any dormant aliases.
      if (!$registry.has(scope.alias)) {

        const { $scopes } = context;
        const { $reference } = $.components;

        if (scope.alias in $scopes) {

          // This could be potentially expensive but in majority of cases will
          // have little imposed impact. If we reach this iteration cycle then
          // we have reference aliases existing in context which can be matched
          // with the instance of the current component. We need to transfer all
          // the related events, nodes or binds from the dormant context instance
          // to the instance we have currently scoped. The $reference proxy will
          // need to be aligned which is why we "for in" each property and re-assign.
          for (const {
            events,
            nodes,
            binds
          } of $scopes[scope.alias]) {

            for (const e in events) {
              scope.events[e] = events[e];
              $reference[e] = key;
            }

            for (const n in nodes) {
              scope.nodes[n] = nodes[n];
              $reference[n] = key;
            }

            for (const b in binds) {
              scope.binds[b] = binds[b];
              $reference[b] = key;
            }

          }

          // We can now dispose of the dormant aliases in scope as they
          // have be mapped and transferred to the current instance.
          delete $scopes[scope.alias];

        } else {

          // This storage reference is for dormant scopes which have
          // detected but no component instance is avaiable. An instance
          // could be mapped at another time, so for now we simply assign
          // a existing record in component store.
          context.$aliases[scope.alias] = instanceOf;

        }

      } else {

        log(LogType.ERROR, [
          `Component alias "${scope.alias}" matches a component identifer in the registry.`,
          'An alias reference must be unique and cannot match component names.'
        ]);

      }

    } else {

      scope.alias = null;

    }

  } else {

    scope.alias = instanceOf || null;
    scope.instanceOf = null;

    if (scope.status === Hooks.MOUNT) {

      // null value signals that while this instanceOf name
      // does not exist in the registry, it might be an alias
      // so we will create the reference.
      context.$aliases[scope.alias] = null;

    }
  }

  return scope;
}

export function setEvent (
  node: HTMLElement,
  name: string,
  valueRef: string,
  context: Context
) {

  const eventName = name.slice($.config.schema.length);
  const isWindow = eventName.startsWith('window:');
  const hasOptions = valueRef.indexOf('{');
  const values = valueRef.trim().split(hasOptions > -1 ? /(?<=[$_\w}])\s+(?=[$_\w])/ : /\s+/);

  for (const value of values) {

    const event: ComponentEvent = o();
    const listener = new AbortController();

    /* -------------------------------------------- */
    /* POPULATE MODEL                               */
    /* -------------------------------------------- */

    event.key = `e.${u.uuid()}`;
    event.dom = `${context.$element}`;
    event.isWindow = isWindow;
    event.eventName = isWindow ? eventName.slice(7) : eventName;
    event.attached = false;
    event.status = 'connect';
    event.selector = getSelector(node, u.escSelector(name), value, value.length > 1);
    event.params = null;
    event.options = { signal: listener.signal };

    let attrVal: string = value;

    if (hasOptions > -1) {

      const args = value
        .slice(hasOptions, value.lastIndexOf('}', hasOptions))
        .match(/(passive|once|capture)/g);

      if (args !== null) {
        if (args.indexOf('once') > -1) event.options.once = true;
        if (args.indexOf('passive') > -1) event.options.passive = true;
        if (args.indexOf('capture') > -1) event.options.capture = true;
      }

      attrVal = value.slice(0, hasOptions);

    }

    /* -------------------------------------------- */
    /* EVENT METHOD                                 */
    /* -------------------------------------------- */

    const eventValue = u.attrValueNotation(attrVal);

    // We only allow one method to be passed per event
    // Let's warn if more than 1 sequence is passed.
    if (eventValue.length > 1) {
      log(LogType.WARN, `No more than 1 DOM Event listener method allowed in value: ${value}`);
    }

    // Deconstruct event value, we use dot . notation, thus we split.
    const [ instanceOf, method ] = eventValue[0].split('.');
    const scope: Scope = getScope(instanceOf, context);

    event.listener = listener;
    event.method = method.trim();

    scope.events[event.key] = event;

    setDomRef(node, scope.key, event.key, event.selector);

  }
}

export function setNodes (
  node: HTMLElement,
  value: string,
  context: Context
) {

  const nodes = u.attrValueNotation(value);

  for (const nodeValue of nodes) {

    const [ instanceOf, keyProp ] = nodeValue.split('.');
    const scope: Scope = getScope(instanceOf, context);
    const selector = getSelector(node, $.qs.$node, value, nodes.length > 1);
    const key = setDomRef(node, scope.key, `n.${u.uuid()}`, selector);

    scope.nodes[key] = o<ComponentNodes>({
      key,
      keyProp,
      selector,
      dom: context.$element,
      schema: `${keyProp}Node`,
      status: 'connect',
      isChild: scope.status === Hooks.MOUNT || scope.status === Hooks.MOUNTED
    });

  }

}

export function setBinds (
  node: HTMLElement,
  value: string,
  context: Context
) {

  for (const bindValue of u.attrValueNotation(value)) {

    const [ instanceOf, stateKey ] = bindValue.split('.');
    const scope: Scope = getScope(instanceOf, context);
    const selector = getSelector(node, $.qs.$bind, value);
    const key = setDomRef(node, scope.key, `b.${u.uuid()}`, selector);

    if (!(stateKey in scope.binds)) scope.binds[stateKey] = o();

    scope.binds[stateKey][key] = o<ComponentBinds>({
      key,
      stateKey,
      selector, // `[${$.qs.$ref}*=${u.escSelector(key)}]`,
      value: node.innerText,
      dom: context.$element,
      status: 'connect',
      stateAttr: `${$.config.schema}${instanceOf}:${stateKey}`,
      isChild: scope.status === Hooks.MOUNT || scope.status === Hooks.MOUNTED
    });

  }
}

export function setAttrs (
  node: HTMLElement,
  context: Context,
  instanceOf?: string,
  alias?: string
) {

  if (instanceOf === null && alias === null) {
    context.$element = u.uuid();
    $.components.$elements.set(context.$element, node);
  }

  for (let n = node.attributes.length - 1; n >= 0; n--) {

    const { name, value } = node.attributes[n];

    if (instanceOf) {

      let schema = `${$.config.schema}${instanceOf}:`;

      if (alias && !name.startsWith(schema)) schema = `${$.config.schema}${alias}:`;

      if (name.startsWith(schema)) {
        getScope(instanceOf, context).state[u.camelCase(name.slice(schema.length))] = value;
      }
    }

    /* -------------------------------------------- */
    /* DIRECTIVES                                   */
    /* -------------------------------------------- */

    if (name.indexOf('@') > -1) {

      setEvent(node, name, value, context);

    } else if (name === $.qs.$bind) {

      setBinds(node, value, context);

    } else if (name === $.qs.$node) {

      setNodes(node, value, context);

    }

  }

}

export function setComponent (node: HTMLElement, value: string, context: Context) {

  const { $registry, $elements } = $.components;
  const { $scopes, $aliases } = context;
  const id = node.hasAttribute('id') ? node.id.trim() : null;

  $elements.set((context.$element = u.uuid()), node);

  for (const instanceOf of getComponentValues(value)) {

    if (!$registry.has(instanceOf)) {

      log(LogType.ERROR, `Component does not exist in registry: ${instanceOf}`);

    } else {

      let scope: Scope;

      if (instanceOf in $scopes) {

        scope = u.last($scopes[instanceOf]);

        // Status of UNMOUNTED signals that a scope exists and was already created
        // before reaching the component element. In such cases, we can proceed to
        // setting the DOM Ref identifier.
        //
        if (scope.status === Hooks.UNMOUNTED) {

          scope.selector = getSelector(node, $.qs.$component);
          scope.dom = context.$element;
          scope.status = Hooks.MOUNT;
          scope.inFragment = fragment.contains(node);

          setDomRef(
            node,
            scope.key,
            scope.ref,
            scope.selector
          );

        } else {

          // When the scope status does not equal to UNMOUNTED then we
          // we need to set a new scope, because one already exists. Because
          // our component identifier is present in $scope context, we can simply
          // push it onto the record as it signals another component occurence.
          //
          $scopes[instanceOf].push(setScope(instanceOf, node, context));

        }

      } else {

        // Getting here requires us to create a reference in our context.
        // When our $scopes model is empty, we will generate a new scope
        // list for each occurance we may come accross.
        //
        $scopes[instanceOf] = [ setScope(instanceOf, node, context) ];

      }

      // Lets realign out scope variable to the last known record in the stack
      scope = u.last($scopes[instanceOf]);

      // Lets handle component alias identifers
      //
      if (id && !(id in $aliases)) $aliases[id] = instanceOf;

      // Last process here is walking component directives (attributes)
      //
      setAttrs(node, context, instanceOf, scope.alias);

    }

  };

}

/* -------------------------------------------- */
/* COMPONENTS                                   */
/* -------------------------------------------- */

export function getComponents (nodes?: Set<HTMLElement> | HTMLElement) {

  const context: Context = getContext();

  if (!nodes) {

    const snapshot = snap.set($.snapDom.body);

    walkElements(d(), node => walkNode(node, context));

    if (u.isEmpty(context.$scopes)) return;

    setInstances(context, snapshot);

  } else if (nodes instanceof Set) {

    for (const node of nodes) walkNode(node, context);

    nodes.clear();

    return context;

  } else {

    walkNode(nodes, context);

    return context;
  }

}
