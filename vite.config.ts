import react from '@vitejs/plugin-react'
import path from 'path'
import unocss from 'unocss/vite'
import autoImportPlugin from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
import reactXIf from 'vite-plugin-react-x-if'

const autoImport = autoImportPlugin({
  imports: [
    'react',
    'react-router',
    'mobx-react-lite',
    {
      classix: ['cx'],
      valtio: ['useSnapshot'],
      '@gitborlando/signal': ['Signal'],
      'src/view/assets/assets': ['Assets'],
      'src/shared/signal/signal': ['createSignal'],
      'src/view/component/grid': ['Grid', 'G'],
      'src/editor/schema/y-state': ['YState'],
      'src/editor/schema/y-undo': ['YUndo'],
      'src/shared/utils/global': ['t'],
    },
  ],
  exclude: ['src/shared/**'],
})

export default defineConfig(() => {
  return {
    plugins: [react(), unocss(), autoImport, reactClickToComponent(), reactXIf()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
        types: path.resolve(__dirname, 'types'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import 'src/view/styles/variable.less';`,
        },
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
