import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isReact = mode === 'react'
  const isVue = mode === 'vue'
  return {
    plugins: [react(), vue()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
    },
    define: {
      __REACT__: isReact,
      __VUE__: isVue,
    },
  }
})
