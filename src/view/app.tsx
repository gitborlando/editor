import '@arco-design/web-react/dist/css/arco.css'
import './app.less'
import './styles/acro.less'

import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { RouterProvider } from 'react-router'
import { MenuComp } from 'src/view/component/menu'
import { UploaderComp } from 'src/view/component/uploader'
import router from 'src/view/router'

export const App: FC = memo(() => {
  return (
    <Flex layout='v' className='wh-100vw-100vh' onContextMenu={(e) => e.preventDefault()}>
      <MenuComp />
      <UploaderComp />
      <RouterProvider router={router} />
    </Flex>
  )
})
