import { FC, memo } from 'react'
import { IMenuItem, Menu } from '~/global/menu/menu'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useSubComponent } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'

const offset = 5

type IMenuComp = {}

export const MenuComp: FC<IMenuComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { setRef, xy, menuOptions, closeMenu } = Menu
  useHookSignal(menuOptions)

  const MenuItemComp = useSubComponent<{ item: IMenuItem }>([], ({ item }) => {
    return (
      <Flex
        layout='h'
        className={classes.menuItem}
        onClick={() => void item.callback() || closeMenu()}>
        <Flex>{item.label}</Flex>
        <Flex style={{ marginLeft: 'auto' }}>{item.shortcut}</Flex>
      </Flex>
    )
  })

  const DivideComp = useSubComponent([], ({}) => {
    return <Divide direction='h' length='100%' margin={4} bgColor='rgba(0,0,0,0.05)' />
  })

  const MenuOptionsComp = useSubComponent<{ menuOptions: IMenuItem[][] }>([], ({ menuOptions }) => {
    return menuOptions.map((group, groupIndex) => {
      const menuGroup = group.map((item, index) => <MenuItemComp key={index} item={item} />)
      if (groupIndex !== menuOptions.length - 1) menuGroup.push(<DivideComp key={Math.random()} />)
      return menuGroup
    })
  })

  return (
    <Flex
      layout='v'
      ref={setRef}
      vshow={menuOptions.value.length > 0}
      className={classes.Menu}
      style={{ left: xy.value.x + offset, top: xy.value.y + offset }}>
      <MenuOptionsComp menuOptions={menuOptions.value} />
    </Flex>
  )
})

type IMenuCompStyle = {} /* & Required<Pick<IMenuComp>> */ /* & Pick<IMenuComp> */

const useStyles = makeStyles<IMenuCompStyle>()((t) => ({
  Menu: {
    ...t.rect(200, 'fit-content', 2, 'white'),
    borderBottom: '1px solid gray',
    padding: 6,
    position: 'fixed',
    zIndex: 999,
    boxShadow: '0px 0px 4px  rgba(0, 0, 0, 0.15)',
  },
  menuItem: {
    ...t.rect('100%', 30, 2),
    ...t.default$.hover.background,
    ...t.cursor('pointer'),
    ...t.default$.font.normal,
    paddingInline: 8,
  },
}))

MenuComp.displayName = 'MenuComp'
