import { emit } from './events';
import { parse } from './dom';
import { IPage } from '../types/page';
import { schema, tracked, config, snaps } from './state';
import * as store from './store';
import * as mouseover from '../observers/hover';
import * as intersect from '../observers/intersect';
import { evaljs } from '../observers/scripts';
import { StoreType } from '../constants/enums';
import { toArray, history } from '../constants/native';
import * as progress from './progress';
import * as proximity from '../observers/proximity';

/**
 * Node Positions
 */
function nodePosition (a: Element, b: Element) {

  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING || -1;

}

/**
 * Script Nodes
 *
 * Executes `<script>` node javascript
 * evaluations and loading.
 */
async function scriptNodes (target: HTMLHeadElement) {

  const scripts: HTMLScriptElement[] = toArray(target.querySelectorAll(schema.scripts));

  scripts.sort(nodePosition);

  await evaljs(scripts);

}

/**
 * Tracked Nodes
 *
 * '[data-pjax-track]:not([data-pjax-track="hydrate"])'
 */
function trackedNodes (target: HTMLElement): void {

  const nodes = target.querySelectorAll(schema.track);

  nodes.forEach((node) => {

    // tracked element must contain id
    if (!node.hasAttribute('id')) return;

    if (!tracked.has(node.id)) {
      document.body.appendChild(node);
      tracked.add(node.id);
    }
  });

}

/**
 * Render Nodes
 *
 * Renders the new page navigation nodes replacing the
 * current pages targets with the destination targets.
 * This function is also responsible for handling append,
 * prepend and tracked replacements of element in the dom.
 */
function renderNodes (state: IPage, target: Document) {

  const nodes = state.replace ? state.replace : config.targets;
  const selector = nodes.join(',');
  const current = document.body.querySelectorAll<HTMLElement>(selector);

  if (current.length === 0) return document.body.replaceWith(target.body);

  const fetched = target.body.querySelectorAll<HTMLElement>(selector);
  // const ignored = isArray(state.ignore) ? state.ignore.join(',') : false;

  current.forEach((node, i) => {

    if (!node.matches(nodes[i])) return;
    if (!emit('render', node, fetched[i])) return;

    node.replaceWith(fetched[i]);

    if (state.append || state.prepend) {
      const fragment = document.createElement('div');
      target.childNodes.forEach(fragment.appendChild);
      return state.append
        ? node.appendChild(fragment)
        : node.insertBefore(fragment, node.firstChild);
    }

  });

  trackedNodes(target.body);

}

/**
 * Node Hydration
 *
 * Executes node replacements hydrating the DOM with
 * the fetched target. All nodes provided with `data-pjax-hydrate`
 * or via the `visit.hydrate[]` method are replaced. TextNode types
 * will be swapped out via `innerHTML` to prevent missing replacements
 * for occuring.
 */
function hydrateNodes (state: IPage, target: Document): void {

  const nodes = state.hydrate.join(',');
  const current = document.body.querySelectorAll<HTMLElement>(nodes);

  if (current.length > 0) {

    const fetched = target.body.querySelectorAll<HTMLElement>(nodes);

    current.forEach((node, i) => {

      if (!emit('hydrate', node, fetched[i])) return;

      // InnerHTML replacment on text nodes
      if (node.firstChild.nodeType === Node.TEXT_NODE) {
        node.innerHTML = fetched[i].innerHTML;
      } else {
        node.replaceWith(fetched[i]);
      }

    });
  }

  state.history = undefined;
  state.type = StoreType.VISIT;

  store.update(state);
  store.purge([ state.key ]);

}

/**
 * Update the DOM and execute page adjustments
 * to new navigation point
 */
export function update (state: IPage, popstate?: boolean): IPage {

  // head.stop();

  if (config.hover !== false) mouseover.stop();
  if (config.intersect !== false) intersect.stop();
  if (config.proximity !== false) proximity.stop();

  const target = parse(snaps[state.snapshot]);
  state.title = document.title = target.title || '';

  // styleNodes(target.head);

  if (state.type === StoreType.HYDRATE) {

    hydrateNodes(state, target);

  } else {

    renderNodes(state, target);

    if (state.history) {

      if (!popstate) {
        if (state.key === state.location.lastpath) {
          history.replace(state.location, state);
        } else {
          history.push(state.location, state);
        }
      }

      scrollTo(state.position.x, state.position.y);

    }
  }

  scriptNodes(target.head);

  progress.done();

  if (config.hover !== false) mouseover.start();
  if (config.intersect !== false) intersect.start();
  if (config.proximity !== false) proximity.start();

  emit('load', state);

  return state;

}
