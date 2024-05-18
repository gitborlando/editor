import { FC, memo } from 'react'
import { initApp } from '~/global/initialize'
import { withSuspense } from '~/shared/utils/react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { MenuComp } from './component/menu'
import { UploaderComp } from './component/uploader'
import { EditorComp } from './editor/editor'

initApp()

type IAppProps = {}

export const App: FC<IAppProps> = memo(() => {
  return (
    <Flex className='lay-v wh-100vw-100vh bg-white' onContextMenu={(e) => e.preventDefault()}>
      {withSuspense(<EditorComp />, '加载中...')}
      <MenuComp />
      <UploaderComp />
    </Flex>
  )
})
