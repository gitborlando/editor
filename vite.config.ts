import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import linaria from '@wyw-in-js/vite'
import path from 'path'
import autoImportPlugin from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import reactXIf from 'vite-plugin-react-x-if'

const autoImport = autoImportPlugin({
  imports: [
    'react',
    'react-router',
    'mobx',
    'mobx-react-lite',
    {
      valtio: ['useSnapshot'],
      '@linaria/core': ['css', 'cx'],
      '@gitborlando/geo': ['AABB', 'OBB', 'XY'],
      '@gitborlando/signal': ['Signal'],
      'src/view/assets/assets': ['Assets'],
      'src/view/component/grid': ['Grid', 'G', 'C'],
      'src/editor/y-state/y-state': ['YState'],
      'src/editor/y-state/y-clients': ['YClients'],
      'src/editor/y-state/y-undo': ['YUndo'],
      'src/shared/utils/global': ['t'],
      'src/global/color': ['COLOR'],
      'src/view/styles/styles': ['styles'],
      'src/view/styles/classes': ['classes'],
    },
    {
      from: 'react',
      imports: ['FC', 'ReactNode'],
      type: true,
    },
  ],
})

export default defineConfig(() => {
  return {
    plugins: [react(), autoImport, reactXIf(), tailwindcss(), linaria()],
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
