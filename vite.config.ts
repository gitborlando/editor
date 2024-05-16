import react from '@vitejs/plugin-react'
import path from 'path'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    plugins: [react(), unocss()],
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
