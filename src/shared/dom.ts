/**
 * DOM Parser
 */
const parser: DOMParser = new DOMParser();

/**
  * Parse HTML document string from request response
  * using `parser()` method. Cached pages will pass
  * the saved response here.
  */
export function parse (HTMLString: string): Document {

  return parser.parseFromString(HTMLString, 'text/html');

}

/**
 * Extract the document title text from the
 * `<title>` tag of a dom string.
 */
export function getTitle (dom: string) {

  const start = dom.indexOf('>', dom.indexOf('<title')) + 1;
  const end = dom.indexOf('</title', start);

  return dom.slice(start, end);
}
