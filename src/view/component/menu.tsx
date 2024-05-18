import { FC, memo } from 'react'
import { IEditorCommand } from '~/editor/editor/command'
import { Menu } from '~/global/menu'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useMemoComp } from '~/shared/utils/react'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'

const offset = 5

type IMenuComp = {}

export const MenuComp: FC<IMenuComp> = memo(({}) => {
  const { setRef, xy, menuOptions, closeMenu } = Menu
  useHookSignal(menuOptions)

  const MenuItemComp = useMemoComp<{ item: IEditorCommand }>([], ({ item }) => {
    return (
      <Flex
        id='menu'
        className='lay-h wh-100%-30-2 pointer normalFont px-8 hover:(bg-hslb93)'
        onClick={() => void item.callback() || closeMenu()}>
        <Flex>{item.name}</Flex>
        <Flex className='ml-auto'>{item.shortcut}</Flex>
      </Flex>
    )
  })

  const DivideComp = useMemoComp([], ({}) => {
    return <Divide direction='h' length='100%' margin={4} bgColor='rgba(0,0,0,0.05)' />
  })

  const MenuOptionsComp = useMemoComp<{ menuOptions: IEditorCommand[][] }>(
    [],
    ({ menuOptions }) => {
      return menuOptions.map((group, groupIndex) => {
        const menuGroup = group.map((item, index) => <MenuItemComp key={index} item={item} />)
        if (groupIndex !== menuOptions.length - 1)
          menuGroup.push(<DivideComp key={Math.random()} />)
        return menuGroup
      })
    }
  )

  return (
    <Flex
      ref={setRef}
      vshow={menuOptions.value.length > 0}
      className='lay-v wh-200-fit-2 bg-white p-6 fixed z-999 shadow-4-0-rgba(0,0,0,0.15)'
      style={{ left: xy.value.x + offset, top: xy.value.y + offset }}>
      <MenuOptionsComp menuOptions={menuOptions.value} />
    </Flex>
  )
})
