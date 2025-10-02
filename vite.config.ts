import react from '@vitejs/plugin-react'
import path from 'path'
import unocss from 'unocss/vite'
import autoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

const autoImportConfig = autoImport({
  imports: [
    'react',
    'react-router',
    'mobx-react-lite',
    {
      'src/view/assets/assets': ['Assets'],
      'src/shared/signal/signal': ['createSignal'],
    },
  ],
  exclude: ['src/shared/**'],
})

export default defineConfig(() => {
  return {
    plugins: [react(), unocss(), autoImportConfig, reactClickToComponent()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import 'src/view/component/styles/variable.less';`,
        },
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  }
})
