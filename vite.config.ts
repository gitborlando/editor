import react from '@vitejs/plugin-react'
import path from 'path'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import { reactClickToComponent } from 'vite-plugin-react-click-to-component'

export default defineConfig(() => {
  return {
    plugins: [react(), unocss(), reactClickToComponent()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      port: 3000,
    },
  }
})
