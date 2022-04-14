import { rollup, plugin, env } from '@brixtol/rollup-config';

export default rollup(
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'esm',
        name: 'Pjax',
        exports: 'named',
        file: 'package/pjax.mjs',
        sourcemap: false,
        esModule: true,
        freeze: false,
        preferConst: true
      },
      {
        format: 'umd',
        name: 'Pjax',
        exports: 'named',
        file: 'package/pjax.js',
        sourcemap: false,
        esModule: true,
        freeze: false,
        preferConst: true
      }
    ],
    treeshake: 'smallest',
    plugins: env.if('dev')(
      [
        plugin.esbuild({
          minify: true,
          optimizeDeps: {
            esbuildOptions: {
              format: 'esm',
              bundle: true,
              treeShaking: true,
              platform: 'browser',
              minify: true
            },
            include: [
              'history',
              'nanoid',
              'detect-it'
            ]
          }
        }),

        plugin.copy(
          {
            copyOnce: env.watch,
            onlyFiles: true,
            targets: [
              {
                src: 'src/types/*',
                dest: 'package/types'
              }
            ]
          }
        )
      ]
    )(
      [
        plugin.filesize()
      ]
    )
  }
);
