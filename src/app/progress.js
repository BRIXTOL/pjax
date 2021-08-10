import nprogress from 'nprogress'

/* -------------------------------------------- */
/* LETTINGS                                     */
/* -------------------------------------------- */

/**
 * @type {nprogress.NProgress}
 */
export let progress = null

/* -------------------------------------------- */
/* FUNCTIONS                                    */
/* -------------------------------------------- */

/**
 * Setup nprogress
 *
 * @export
 * @param {Store.IProgress} options
 */
export const config = ({ style, options }) => {

  progress = nprogress.configure({
    ...options,
    template: '<div class="bar" role="bar"><div class="peg"></div></div>'
  })

}
