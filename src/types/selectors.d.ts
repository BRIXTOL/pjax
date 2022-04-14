export interface IHeadConfig {
  link?: { [prop: string]: boolean | RegExp; },
  script?: { [prop: string]: boolean | RegExp; },
  style?: { [prop: string]: boolean | RegExp; }
  meta?: { [prop: string]: boolean | RegExp; }
}

export interface ISelectors {
  /**
   * Attributes Expression
   *
   * Used to match Pjax data attribute names
   */
  attrs?: RegExp;
  /**
   * Scripts
   *
   * Attribute only select type, see render.ts
   */
  scripts?: string;
  /**
   * Inline styles
   *
   * Tracker for eval
   */
  styles?: string;
  /**
   * External Style link rel
   *
   */
  stylelink?: string;
  /**
   * Hydration selector
   *
   * Selects `<a>` href nodes only.
   */
  hydrate?: string;
  /**
   * Tracked nodes
   *
   * Selects all element with the attribute selector excluding hrefs
   *
   * ---
   *
   * **EXCLUDED**:
   *
   * - `<a>`
   * - `<div data-pjax-track="false">`
   */
  track?: string;
  /**
   * Href link selector
   *
   * ---
   *
   * **EXCLUDED**:
   *
   * - `<a href="#">`
   * - `<a data-pjax-disable">`
   */
  href?: string;
  /**
   * Mouseover selector
   *
   * Selects `<a>` href nodes only.
   *
   * ---
   *
   * **EXCLUDED**:
   *
   * - `<a href="#">`
   * - `<a data-pjax-mouseover="false">`
   * - `<a data-pjax-intersect>`
   * - `<a data-pjax-disable">`
   */
  mouseover?: string;
  /**
   * Intersection Selectors
   *
   * Elements can be targeted which contain `<a>` nodes.
   *
   * ---
   *
   * **EXCLUDED**:
   *
   * - `<div data-pjax-intersect="false">`
   */
  intersect?: string;
  /**
   * Intersection hrefs
   *
   * When an element is targets this is used to select the
   * inner `<a>` nodes of the element.
   *
   * ---
   *
   * **EXCLUDED**:
   *
   * - `<a href="#">`
   * - `<a data-pjax-intersect="false">`
   * - `<a data-pjax-disable">`
   */
  interhref?: string;
  /**
   * Proximity hrefs
   *
   * Selects `<a>` href nodes only, proximity nodes will
   * also be added to `mouseover` selectors as a fallback.
   *
   * ---
   *
   * **EXCLUDED**:
   *
   * - `<a href="#">`
   * - `<a data-pjax-proximity="false">`
   * - `<a data-pjax-disable">`
   */
  proximity?: string;

}
