import { Flex, Icon } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { EditorCommand } from 'src/editor/editor/command'
import { OperatePage } from 'src/editor/operate/page'
import { Schema } from 'src/editor/schema/schema'
import { Menu } from 'src/global/menu'
import { useMatchPatch } from 'src/shared/utils/react'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = memo(({ name, id }) => {
  const selected = Schema.client.selectPageId === id
  const openMenu = () => {
    Menu.context = { id }
    Menu.menuOptions.dispatch([EditorCommand.pageGroup])
  }
  const selectPage = () => {
    OperatePage.selectPage(id)
    Schema.commitHistory('选择页面 ' + id)
  }
  useMatchPatch(`/client/selectPageId`)

  return (
    <Flex
      layout='h'
      className='justify-between wh-100%-32 bg-white pointer shrink-0 d-hover-border'
      onClick={selectPage}
      onContextMenu={openMenu}>
      <Flex layout='h' className='text-12 px-10'>
        {name}
      </Flex>
      {selected && (
        <Icon
          className='wh-18 mr-10 path-fill-hsl60'
          url={Assets.editor.leftPanel.page.pageSelect}
        />
      )}
    </Flex>
  )
})
