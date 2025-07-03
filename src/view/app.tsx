import { FC, memo } from 'react'
import { RouterProvider } from 'react-router'
import { MenuComp } from 'src/view/component/menu'
import { UploaderComp } from 'src/view/component/uploader'
import router from 'src/view/router'
import { Flex } from 'src/view/ui-utility/widget/flex'
import './app.less'

export const App: FC = memo(() => {
  return (
    <Flex className='lay-v wh-100vw-100vh' onContextMenu={(e) => e.preventDefault()}>
      <MenuComp />
      <UploaderComp />
      <RouterProvider router={router} />
    </Flex>
  )
})
