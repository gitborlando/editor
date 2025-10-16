import { Flex } from '@gitborlando/widget'
import { Check } from 'lucide-react'
import { FC, memo } from 'react'
import { EditorCommand } from 'src/editor/editor/command'
import { YClients } from 'src/editor/schema/y-clients'
import { Menu } from 'src/global/menu'
import { useSelectPageId } from 'src/view/hooks/schema/use-y-client'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = memo(({ name, id }) => {
  const openMenu = () => {
    Menu.context = { id }
    Menu.menuOptions.dispatch([EditorCommand.pageGroup])
  }
  const selectPage = () => {
    YClients.selectPage(id)
    // Schema.commitHistory('选择页面 ' + id)
  }
  // useMatchPatch(`/client/selectPageId`)

  const selectPageId = useSelectPageId()
  const selected = selectPageId === id

  return (
    <Flex
      layout='h'
      className='justify-between wh-100%-32 bg-white pointer shrink-0 d-hover-border'
      onClick={selectPage}
      onContextMenu={openMenu}>
      <Flex layout='h' className='text-12 px-10'>
        {name}
      </Flex>
      <Check x-if={selected} size={18} className='mr-10 text-hsl60' />
    </Flex>
  )
})
