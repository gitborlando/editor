import { FC, memo } from 'react'
import { MenuComp } from 'src/view/component/menu'
import { UploaderComp } from 'src/view/component/uploader'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { EditorComp } from './editor/editor'
import 'virtual:uno.css'

export const App: FC = memo(() => {
  return (
    <Flex className='lay-v wh-100vw-100vh' onContextMenu={(e) => e.preventDefault()}>
      <EditorComp />
      <MenuComp />
      <UploaderComp />
    </Flex>
  )
})
