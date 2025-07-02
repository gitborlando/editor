import './app.less'
import { FC, memo } from 'react'
import { MenuComp } from 'src/view/component/menu'
import { UploaderComp } from 'src/view/component/uploader'
import { EditorComp } from './editor/editor'
import { Flex } from 'src/view/component/flex/flex'

export const App: FC = memo(() => {
  return (
    <Flex vshow={false} className='lay-v wh-100vw-100vh' onContextMenu={(e) => e.preventDefault()}>
      <EditorComp />
      <MenuComp />
      <UploaderComp />
    </Flex>
  )
})
