import { IProgress } from 'types';
import { config } from './session';

/**
 * Progress Status
 */
let status = null;

/**
 * Progress Status
 */
let timeout: NodeJS.Timeout;

/**
 * Progress Element
 */
let element: HTMLDivElement = null;

/**
 * Pending Queue
 */
const pending = [];

/**
 * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
 */
function setProgress (n: number) {

  const { speed, easing, minimum } = config.progress as IProgress;
  const started = typeof status === 'number';

  n = clamp(n, minimum, 1);

  status = (n === 1 ? null : n);

  const progress = render(!started);

  progress.offsetWidth; // eslint-disable-line no-unused-expressions

  queue((next: () => void) => {

    // Add transition
    progress.style.transform = `translate3d(${percentage(n)}%,0,0)`;
    progress.style.transition = `all ${speed}ms ${easing}`;

    if (n !== 1) return setTimeout(next, speed);

    progress.style.transition = 'none';
    progress.style.opacity = '1';
    progress.offsetWidth; // eslint-disable-line no-unused-expressions

    setTimeout(() => {

      progress.style.transition = `all ${speed}ms ${easing}`;
      progress.style.opacity = '0';
      setTimeout(() => [ remove(), next() ], speed);

    }, speed);

  });

};

/**
 * Increments by a random amount.
 */
function increment (amount?: number) {

  let n = status;

  if (!n) return start();

  if (n < 1) {

    if (typeof amount !== 'number') {
      if (n >= 0 && n < 0.2) amount = 0.1;
      else if (n >= 0.2 && n < 0.5) amount = 0.04;
      else if (n >= 0.5 && n < 0.8) amount = 0.02;
      else if (n >= 0.8 && n < 0.99) amount = 0.005;
      else amount = 0;
    }

    n = clamp(n + amount, 0, 0.994);
    return setProgress(n);
  }
};

/**
 * Renders the progress bar markup.
 */
function render (fromStart: boolean): HTMLDivElement {

  if (element) return element;

  document.documentElement.classList.add('spx-load');

  const percent = fromStart ? '-100' : percentage(status || 0);
  const progress = document.createElement('div');

  progress.id = 'spx-progress';
  progress.style.pointerEvents = 'none';
  progress.style.background = (config.progress as IProgress).background;
  progress.style.height = (config.progress as IProgress).height;
  progress.style.position = 'fixed';
  progress.style.zIndex = '9999';
  progress.style.top = '0';
  progress.style.left = '0';
  progress.style.width = '100%';
  progress.style.transition = 'all 0 linear';
  progress.style.transform = `translate3d(${percent}%,0,0)`;

  document.body.appendChild(progress);

  element = progress;

  return progress;

};

/**
 * Removes the element. Opposite of render().
 */
function remove () {

  document.documentElement.classList.remove('spx-load');

  const progress = document.getElementById('spx-progress');
  progress && document.body.removeChild(element);
  element = null;

};

/**
 * Utility clamp for min/max values
 */
function clamp (n: number, min: number, max: number) {

  if (n < min) return min;
  if (n > max) return max;

  return n;
}

/**
 * Converts a percentage (`0..1`) to a bar translateX percentage (`-100%..0%`).
 */
function percentage (n: number) {

  return (-1 + n) * 100;

}

/**
 * Queue execution for the progress bar
 */
function queue (fn: Function) {

  const next = () => {
    const fn = pending.shift();
    if (fn) fn(next);
  };

  pending.push(fn);

  if (pending.length === 1) next();

};

/**
 * Begin Progress
 *
 * Shows the progress bar. This is the same as setting the status to 0%,
 * except that it doesn't go backwards.
 */
export function start (threshold?: number) {

  if (!config.progress) return;

  timeout = setTimeout(function () {

    if (!status) setProgress(0);

    const work = function () {

      setTimeout(() => {
        if (!status) return;
        increment();
        work();
      }, (config.progress as IProgress).trickleSpeed);

    };

    if ((config.progress as IProgress).trickle) work();

  }, threshold || 0);
};

/**
 * Progress Done
 *
 * Hides the progress bar. This is the *sort of* the same as
 * setting the status to 100%, with the difference being `done()`
 * makes some placebo effect of some realistic motion.
 *
 * > If `true` is passed, it will show the progress bar even if its hidden.
 */
export function done (force?: boolean) {

  clearTimeout(timeout);

  if (!force && !status) return;

  increment(0.3 + 0.5 * Math.random());

  return setProgress(1);
};
