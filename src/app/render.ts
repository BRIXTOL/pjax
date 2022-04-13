import history from 'history/browser';
import { emit } from './events';
import { IPage } from '../types/page';
import { schema, tracked, config, snaps } from './state';
import * as store from './store';
import * as mouseover from '../observers/hover';
import * as intersect from '../observers/intersect';
import { evaljs } from '../observers/scripts';
import { toArray } from '../constants/native';
import * as progress from './progress';
// import * as proximity from '../observers/proximity';

/**
 * DOM Parser
 */
const DOMParse: DOMParser = new DOMParser();

/**
 * Haad Nodes
 *
 * Executes `<head></head>` element replacements
 * and evaluations.
 */
async function headNodes (target: HTMLHeadElement) {

  const scripts: HTMLScriptElement[] = toArray(target.querySelectorAll(schema.eval));

  scripts.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING || -1);

  await evaljs(scripts);

}

/**
 * Parse HTML document string from request response
 * using `parser()` method. Cached pages will pass
 * the saved response here.
 */
export function parse (HTMLString: string): Document {

  return DOMParse.parseFromString(HTMLString, 'text/html');

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
  state.type = 'visit';

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
  // if (config.proximity !== false) proximity.stop();

  const target = parse(snaps[state.snapshot]);
  state.title = document.title = target.title || '';

  headNodes(target.head);

  if (state.hydrate) {

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

  progress.done();

  if (config.hover !== false) mouseover.start();
  if (config.intersect !== false) intersect.start();
  // if (config.proximity !== false) proximity.start();

  emit('load', state);

  return state;

}
