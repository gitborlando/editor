import '@arco-design/web-react/dist/css/arco.css'
import './app.less'
import './styles/acro.less'

import { Flex } from '@gitborlando/widget'
import { QueryClientProvider } from '@tanstack/react-query'
import { FC, memo } from 'react'
import { RouterProvider } from 'react-router'
import { Query } from 'src/global/sdk/query'
import { MenuComp } from 'src/view/component/menu'
import { UploaderComp } from 'src/view/component/uploader'
import router from 'src/view/router'

export const App: FC = memo(() => {
  return (
    <Flex layout='v' className='wh-100vw-100vh' onContextMenu={(e) => e.preventDefault()}>
      <QueryClientProvider client={Query}>
        <MenuComp />
        <UploaderComp />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Flex>
  )
})
