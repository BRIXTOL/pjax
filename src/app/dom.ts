/**
 * DOM Parser
 */
const DOMParse: DOMParser = new DOMParser();

/**
  * Parse HTML document string from request response
  * using `parser()` method. Cached pages will pass
  * the saved response here.
  */
export function parse (HTMLString: string): Document {

  return DOMParse.parseFromString(HTMLString, 'text/html');

}
