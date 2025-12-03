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
                  className={cx(
                    cls('item'),
                    item.when && !item.when() && cls('item-disabled'),
                  )}
                  key={item.name}
                  onClick={() => item.callback(ContextMenu.context)}>
                  <G horizontal center>
                    <Text className={cls('item-name')}>{item.name}</Text>
                    <Text x-if={!!item.shortcut} className={cls('item-shortcut')}>
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
  ${styles.borderRadius}
  padding-inline: 4px;

  &-item {
    height: 32px;
    line-height: 32px;
    ${styles.textLabel}
    border-radius: 2px;
    padding-inline: 10px;
    &-shortcut {
      justify-items: end;
    }
    &:not(&-disabled):hover {
      background-color: var(--color-light);
    }
    &:not(&-disabled):hover &-name {
      color: white;
    }
    &-disabled {
      color: #b3b3b3;
      cursor: initial;
      &:hover {
        background-color: transparent;
      }
    }
  }
  &-divider {
    margin-block: 4px;
  }
`)
