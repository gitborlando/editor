import { FC, memo } from 'react'
import { editorCommands } from '~/editor/editor/command'
import { OperatePage } from '~/editor/operate/page'
import { Schema } from '~/editor/schema/schema'
import { Menu } from '~/global/menu'
import { useMatchPatch } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = memo(({ name, id }) => {
  const selected = Schema.client.selectPageId === id
  const openMenu = () => {
    Menu.context = { id }
    Menu.menuOptions.dispatch([editorCommands.pageGroup])
  }
  const selectPage = () => {
    OperatePage.selectPage(id)
    Schema.commitHistory('选择页面 ' + id)
  }
  useMatchPatch(`/client/selectPageId`)

  return (
    <Flex
      className='lay-h justify-between wh-100%-32 bg-white pointer shrink-0 d-hover-border'
      onClick={selectPage}
      onContextMenu={openMenu}>
      <Flex className='lay-h text-12 px-10'>{name}</Flex>
      {selected && (
        <Icon size={18} className={'mr-10 path-fill-hslb60'}>
          {Asset.editor.leftPanel.page.pageSelect}
        </Icon>
      )}
    </Flex>
  )
})
