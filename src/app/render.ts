import { emit } from './events';
import { evaljs } from '../observers/scripts';
import { EventType } from '../shared/enums';
import { toArray } from '../shared/native';
import { parse } from '../shared/dom';
import { IPage } from '../types/page';
import { tracked, snapshots, selectors } from './session';
import * as store from './store';
import * as hover from '../observers/hover';
import * as intersect from '../observers/intersect';
import * as scroll from '../observers/scroll';
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

  const scripts: HTMLScriptElement[] = toArray(target.querySelectorAll(selectors.script));
  scripts.sort(nodePosition);

  await evaljs(scripts);

}

/**
 * Tracked Nodes
 *
 * '[data-spx-track]:not([data-spx-track="hydrate"])'
 */
function trackedNodes (target: HTMLElement): void {

  target.querySelectorAll(selectors.track).forEach((node) => {

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
function renderNodes (page: IPage, target: Document) {

  const nodes = page.replace;

  if (nodes.length === 1 && nodes[0] === 'body') return document.body.replaceWith(target.body);

  const selector = nodes.join(',');
  const current = document.body.querySelectorAll<HTMLElement>(selector);
  const fetched = target.body.querySelectorAll<HTMLElement>(selector);
  // const ignored = isArray(state.ignore) ? state.ignore.join(',') : false;

  current.forEach((node, i) => {

    if (!node.matches(nodes[i])) return;
    if (!emit('render', node, fetched[i])) return;

    node.replaceWith(fetched[i]);

    if (page.append || page.prepend) {
      const fragment = document.createElement('div');
      target.childNodes.forEach(fragment.appendChild);
      return page.append ? node.appendChild(fragment) : node.insertBefore(fragment, node.firstChild);
    }

  });

  trackedNodes(target.body);

}

/**
 * Node Hydration
 *
 * Executes node replacements hydrating the DOM with
 * the fetched target. All nodes provided with `data-spx-hydrate`
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

      if (!fetched[i]) return;
      if (!emit('hydrate', node, fetched[i])) return;

      // InnerHTML replacment on text nodes
      if (node.firstChild.nodeType === Node.TEXT_NODE) {
        node.innerHTML = fetched[i].innerHTML;
      } else {
        node.replaceWith(fetched[i]);
      }
    });

  }

  state.type = EventType.VISIT;
  store.update(state);
  store.purge(state.key);

}

/**
 * Update the DOM and execute page adjustments
 * to new navigation point
 */
export function update (page: IPage): IPage {

  hover.disconnect();
  intersect.disconnect();
  proximity.disconnect();

  const target = parse(snapshots[page.uuid]);

  if (page.type === EventType.HYDRATE) {
    hydrateNodes(page, target);
  } else {
    renderNodes(page, target);
    scrollTo(page.position.x, page.position.y);
  }

  scriptNodes(target.head);

  progress.done();
  scroll.reset();

  hover.connect();
  intersect.connect();
  proximity.connect();

  emit('load', page);

  return page;

}
