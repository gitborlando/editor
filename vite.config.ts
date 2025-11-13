import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import linaria from '@wyw-in-js/vite'
import path from 'path'
import autoImportPlugin from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import reactXIf from 'vite-plugin-react-x-if'

export default defineConfig(() => {
  return {
    plugins: [autoImport(), linaria(), react(), reactXIf(), tailwindcss()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
        types: path.resolve(__dirname, 'types'),
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      open: true,
    },
  }
})

const autoImport = () =>
  autoImportPlugin({
    imports: [
      'react',
      'react-router',
      'mobx',
      'mobx-react-lite',
      'react-i18next',
      {
        color: [['default', 'Color']],
        'auto-bind': [['default', 'autoBind']],
        '@linaria/core': ['css', 'cx'],
        '@gitborlando/geo': ['AABB', 'OBB', 'XY', 'max', 'min'],
        '@gitborlando/signal': ['Signal'],
        'src/view/assets/assets': ['Assets'],
        'src/view/component/grid': ['Grid', 'G', 'C'],
        'src/view/component/lucide': ['Lucide'],
        'src/editor/y-state/y-state': ['YState'],
        'src/editor/y-state/y-clients': ['YClients'],
        'src/editor/y-state/y-undo': ['YUndo'],
        'src/utils/global': ['T'],
        'src/utils/color': ['COLOR', 'colorConvert'],
        'src/view/styles/styles': ['styles'],
        'src/view/styles/classes': ['classes'],
        'src/utils/disposer': ['Disposer'],
      },
      {
        from: 'react',
        imports: ['FC', 'ReactNode', 'ComponentPropsWithRef'],
        type: true,
      },
      {
        from: '@gitborlando/geo',
        imports: ['IXY'],
        type: true,
      },
    ],
  })
