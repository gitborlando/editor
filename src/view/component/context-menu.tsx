import { Menu as ArcoMenu, Divider, Dropdown } from '@arco-design/web-react'
import { ContextMenu } from 'src/global/context-menu'
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
                <ArcoMenu.Item
                  className={cls('item')}
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
  border-radius: 3px;

  &-item {
    height: 32px;
    line-height: 32px;
    ${styles.textLabel}
    &:hover {
      color: var(--color);
      background-color: var(--color-bg);
    }
  }

  &-divider {
    margin-block: 4px;
  }
`)
