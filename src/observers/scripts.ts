import { create, toArray } from '../constants/native';
import { MimeType } from '../constants/regexp';

/**
 * Evaluate JavaScript
 *
 * Evaluates `<script></script>` tags. Parses the contained
 * tags and runs them.
 */
function evaluator (exec: ReturnType<typeof scriptTag>): Promise<void> {

  return new Promise((resolve, reject) => {

    const script = document.createElement('script');

    script.addEventListener('error', reject);
    script.async = false;
    script.text = exec.target.text;

    for (const { nodeName, nodeValue } of exec.target.attributes) {
      script.setAttribute(nodeName, nodeValue);
    }

    if (document.contains(exec.target)) {
      exec.target.replaceWith(script);
    } else {
      document.head.append(script);
      exec.external ? script.addEventListener('load', () => script.remove()) : script.remove();
    }

    exec.external
      ? script.addEventListener('load', () => resolve())
      : resolve();

  });

}

/**
 * Script Determination
 *
 * Determines the type of inline `<script></script>` tag
 * we are dealing with and returns a configuration object
 * that will be used in evaluation.
 */
function scriptTag (tag: HTMLScriptElement) {

  if (!tag.hasAttribute('src') && !tag.text) return;

  const mime = tag.type ? tag.type.trim().toLowerCase() : 'text/javascript';
  const type = MimeType.test(mime) ? 1 : mime === 'module' ? 2 : NaN;
  const exec: {
    target: HTMLScriptElement;
    external: boolean;
    evaluate: boolean;
    blocking: boolean;
  } = create(null);

  exec.blocking = true;
  exec.evaluate = false;
  exec.external = false;

  if (isNaN(type) || (tag.noModule && type === 1)) return exec;
  if (tag.src) exec.external = true;
  if (type !== 1 || (exec.external && (tag.hasAttribute('async') || tag.defer))) exec.blocking = false;

  exec.evaluate = true;
  exec.target = tag;

  return exec;

}

/**
 * Execute JavaScript
 *
 * Async script execution. Executes evaluation of the
 * `<script></script>` tags.
 */
async function execute (script: ReturnType<typeof scriptTag>) {

  try {

    const evaluate = evaluator(script);
    if (script.blocking) await evaluate;

  } catch (e) {
    console.error(e);
  }

}

/**
 * Find and execute scripts in order.
 * Needed since innerHTML does not run scripts.
 */
export async function evaljs (scripts: Iterable<HTMLScriptElement>): Promise<void> {

  const scriptjs = toArray(scripts, scriptTag).filter(script => script.evaluate);
  const executed = scriptjs.reduce(async (promise: Promise<unknown>, script) => {
    if (script.external) return Promise.all([ promise, execute(script) ]);
    await promise;
    const exec = await execute(script);
    return exec;
  }, Promise.resolve());

  await Promise.race([ executed ]);

}
