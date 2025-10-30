import { Menu as ArcoMenu, Divider, Dropdown } from '@arco-design/web-react'
import { ContextMenu } from 'src/global/context-menu'
import { Text } from 'src/view/component/text'
import './index.less'

export const ContextMenuComp: FC<{}> = observer(({}) => {
  const { setRef, menus } = ContextMenu

  return (
    <Dropdown
      trigger='contextMenu'
      onVisibleChange={(visible) => (ContextMenu.triggered = visible)}
      droplist={
        <ArcoMenu className='context-menu'>
          {menus.map((group, groupIndex) => {
            const list: ReactNode[] = []
            group.forEach((item) => {
              list.push(
                <ArcoMenu.Item
                  className='context-menu-item'
                  key={item.name}
                  onClick={() => item.callback(ContextMenu.context)}>
                  <G horizontal>
                    <Text>{item.name}</Text>
                    <Text x-if={!!item.shortcut} className='justify-end'>
                      {item.shortcut}
                    </Text>
                  </G>
                </ArcoMenu.Item>,
              )
            })
            if (groupIndex !== menus.length - 1) {
              list.push(
                <Divider className='context-menu-divider' key={groupIndex} />,
              )
            }
            return list
          })}
        </ArcoMenu>
      }>
      <div ref={setRef} style={{ position: 'fixed' }}></div>
    </Dropdown>
  )
})
