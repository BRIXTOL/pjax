import { rollup, plugin, env } from '@brixtol/rollup-config';

export default rollup(
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'esm',
        exports: 'named',
        file: 'package/spx.js',
        sourcemap: false,
        esModule: true,
        freeze: false,
        preferConst: true
      }
    ],
    plugins: [
      plugin.esbuild({
        optimizeDeps: {
          esbuildOptions: {
            format: 'esm',
            bundle: true,
            treeShaking: true,
            platform: 'browser'
          },
          include: [
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
      ),
      plugin.filesize()
    ]
  }
);
