/**
 * NProgress Exposed Configuration Options
 */
export interface NProgressOptions {
  /**
   * Changes the minimum percentage used upon starting.
   *
   * @default 0.08
   */
  minimum?: number;
  /**
   * CSS Easing String
   *
   * @default cubic-bezier(0,1,0,1)
   */
  easing?: string;
  /**
   * Animation Speed
   *
   * @default 200
   */
  speed?: number;
  /**
   * Turn off the automatic incrementing behavior
   * by setting this to false.
   *
   * @default true
   */
  trickle?: boolean;
  /**
   * Adjust how often to trickle/increment, in ms.
   *
   * @default 200
   */
  trickleSpeed?: number;
  /**
   * Turn on loading spinner by setting it to `true`
   *
   * @default false
   */
  showSpinner?: boolean;
}

export interface IProgress {
  /**
   * Enable or Disables the progress bar globally. Setting this option
   * to `false` will prevent progress from displaying. When disabled,
   * all `data-pjax-progress` attribute configs will be ignored.
   *
   * ---
   * @default true
   */
  enable?: boolean;

  /**
   * CSS stylings for the progress bar, by default the class styles
   * will be written to the document `<head>` upon connection.
   *
   * @see [NProgress CSS](https://git.io/JJAC4)
   * @default { colour: '#111', height: '2px' }
   */
  style?: {
    /**
     * Whether styles should be rendered inline or not. When passing
     * `false`you will need to apply styling to a CSS document.
     */
    render?: boolean;
    /**
     * Background Colour
     *
     * @default '#111'
     */
    colour?: string;
    /**
     * Shadow Colour
     *
     * @default '2px'
     */
    height?: string;
  };

  /**
   * Controls the progress bar preset threshold. Defines the amount of
   * time to delay before the progress bar is shown.
   *
   * ---
   * @default 350
   */
  threshold?: number;

  /**
   * [N Progress](https://github.com/rstacruz/nprogress) provides the
   * progress bar feature which is displayed between page visits.
   *
   * > _This pjax module does not expose all configuration options of nprogress,
   * but does allow control of some internals. Any configuration options
   * defined here will be passed to the nprogress instance upon initialization._
   */
  options?: NProgressOptions;
}
