import { setBooleanAttribute } from './attributes';

/**
 * Handling of `<option>` element morphs
 */
export function onOptionElement (oldElement: Element, newElement: HTMLOptionElement) {

  let parentNode = oldElement.parentNode;

  if (parentNode) {

    let parentName = parentNode.nodeName.toUpperCase();

    if (parentName === 'OPTGROUP') {
      parentNode = parentNode.parentNode;
      parentName = parentNode && parentNode.nodeName.toUpperCase();
    }

    if (parentName === 'SELECT' && !(parentNode as Element).hasAttribute('multiple')) {

      if (oldElement.hasAttribute('selected') && !newElement.selected) {

        // Workaround for MS Edge bug where the 'selected' attribute can only be
        // removed if set to a non-empty value:
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12087679/

        oldElement.setAttribute('selected', 'selected');
        oldElement.removeAttribute('selected');

      }

      // We have to reset select element's selectedIndex to -1, otherwise setting
      // fromEl.selected using the setBooleanAttribute below has no effect.
      // The correct selectedIndex will be set in the SELECT special handler below.
      (parentNode as HTMLSelectElement).selectedIndex = -1;

    }
  }

  setBooleanAttribute(oldElement, newElement, 'selected');

}

/**
 * The "value" attribute is special for the `<input>` element since it sets
 * the initial value. Changing the "value" attribute without changing the "value"
 * property will have no effect since it is only used to the set the initial value.
 *
 * Similar for the "checked" attribute, and "disabled".
 */
export function onInputElement (oldElement: HTMLInputElement, newElement: HTMLInputElement) {

  setBooleanAttribute(oldElement, newElement, 'checked');
  setBooleanAttribute(oldElement, newElement, 'disabled');

  if (oldElement.value !== newElement.value) oldElement.value = newElement.value;
  if (!newElement.hasAttribute('value')) oldElement.removeAttribute('value');

}

/**
 * Handling of `<textarea>` element morphs
 */
export function onTextareaElement (oldElement: HTMLTextAreaElement, newElement: HTMLTextAreaElement) {

  const { value } = newElement;

  if (oldElement.value !== value) oldElement.value = value;

  const { firstChild } = oldElement;

  if (firstChild) {

    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    const { nodeValue } = firstChild;

    if (nodeValue === value || (!value && nodeValue === oldElement.placeholder)) return;

    firstChild.nodeValue = value;

  }
}

/**
 * We have to loop through children of oldElement, not newElement since nodes can be moved
 * from newElement to oldElement directly when morphing.
 *
 * At the time this special handler is invoked, all children have already been morphed
 * and appended to / removed from oldElement, so using oldElement here is safe and correct.
 */
export function onSelectElement (oldElement: HTMLElement, newElement: HTMLElement) {

  if (!newElement.hasAttribute('multiple')) {

    let i: number = 0;
    let selectedIndex: number = -1;
    let curChild = oldElement.firstElementChild;
    let optgroup: HTMLOptGroupElement;
    let nodeName: string;

    while (curChild) {

      nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();

      if (nodeName === 'OPTGROUP') {

        optgroup = curChild as HTMLOptGroupElement;
        curChild = optgroup.firstElementChild;

      } else {

        if (nodeName === 'OPTION') {

          if (curChild.hasAttribute('selected')) {
            selectedIndex = i;
            break;
          }

          i++;

        }

        curChild = curChild.nextElementSibling;

        if (!curChild && optgroup) {
          curChild = optgroup.nextElementSibling;
          optgroup = null;
        }
      }
    }

    (oldElement as HTMLSelectElement).selectedIndex = selectedIndex;
  }
}