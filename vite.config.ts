import react from '@vitejs/plugin-react'
import path from 'path'
import unocss from 'unocss/vite'
import autoImportPlugin from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

const autoImport = autoImportPlugin({
  imports: [
    'react',
    'react-router',
    'mobx-react-lite',
    {
      'src/view/assets/assets': ['Assets'],
      'src/shared/signal/signal': ['createSignal'],
      'src/view/component/grid': ['Grid', 'G'],
    },
  ],
  exclude: ['src/shared/**'],
})

export default defineConfig(() => {
  return {
    plugins: [react(), unocss(), autoImport, reactClickToComponent()],
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
