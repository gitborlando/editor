import '@arco-design/web-react/dist/css/arco.css'
import './app.less'
import './styles/acro.less'

import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { Query } from 'src/global/sdk/query'
import { preventDefault } from 'src/shared/utils/event'
import { ContextMenuComp } from 'src/view/component/context-menu/index'
import { UploaderComp } from 'src/view/component/uploader'
import router from 'src/view/router'

export const App = observer(() => {
  return (
    <G gap={0} onContextMenuCapture={preventDefault()}>
      <QueryClientProvider client={Query}>
        <ContextMenuComp />
        <UploaderComp />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </G>
  )
})
