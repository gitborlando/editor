import react from '@vitejs/plugin-react'
import path from 'path'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'
import autoImport from 'unplugin-auto-import/vite'

const autoImportConfig = autoImport({
  imports: [
    'react',
    'react-router',
    'mobx',
    'mobx-react-lite',
    {
      'src/view/assets/assets': ['Assets'],
    },
  ],
  dts: 'src/auto-imports.d.ts',
  exclude: ['src/shared/**'],
})

export default defineConfig(() => {
  return {
    plugins: [autoImportConfig, react(), unocss(), reactClickToComponent()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "${path.resolve(__dirname, 'src/view/index.less')}";`,
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
