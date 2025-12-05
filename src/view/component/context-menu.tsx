import { Menu as ArcoMenu, Divider, Dropdown } from '@arco-design/web-react'
import { ContextMenu } from 'src/global/context-menu'
import { MenuItem } from 'src/view/component/arco/menu'
import { CommonBalanceItem } from 'src/view/component/item'
import { Text } from 'src/view/component/text'

export const ContextMenuComp: FC<{}> = observer(({}) => {
  const { setRef, menus } = ContextMenu

  return (
    <Dropdown
      trigger='contextMenu'
      onVisibleChange={(visible) => (ContextMenu.triggered = visible)}
      droplist={
        <ArcoMenu className={cls()}>
          {menus.map((group, groupIndex) => {
            const list: ReactNode[] = []
            group.forEach((item) => {
              list.push(
                <MenuItem
                  disabled={item.when && !item.when()}
                  key={item.name}
                  onClick={() => item.callback(ContextMenu.context)}>
                  <CommonBalanceItem label={item.name}>
                    <Text x-if={!!item.shortcut} className={cls('item-shortcut')}>
                      {item.shortcut}
                    </Text>
                  </CommonBalanceItem>
                </MenuItem>,
              )
            })
            if (groupIndex !== menus.length - 1) {
              list.push(<Divider className={cls('divider')} key={groupIndex} />)
            }
            return list
          })}
        </ArcoMenu>
      }>
      <div ref={setRef} style={{ position: 'fixed' }}></div>
    </Dropdown>
  )
})

const cls = classes(css`
  width: 200px;
  min-height: fit-content;
  ${styles.borderRadius}
  padding-inline: 4px;

  &-divider {
    margin-block: 4px;
  }
`)
