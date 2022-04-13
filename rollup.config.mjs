import { rollup, plugin, env } from '@brixtol/rollup-config';

export default rollup(
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'es',
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
        plugin.esbuild(),
        plugin.resolve(
          {
            browser: true,
            extensions: [
              '.ts',
              '.js'
            ]
          }
        ),
        plugin.replace(
          {
            preventAssignment: true,
            values: {
              'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
          }
        ),
        plugin.commonjs(
          {
            extensions: [
              '.ts',
              '.js'
            ]
          }
        ),
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
        plugin.esminify({ legalComments: 'none' }),
        plugin.filesize()
      ]
    )
  }
);
