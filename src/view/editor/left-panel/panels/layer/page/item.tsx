import { FC } from 'react'
import { commands } from '~/editor/editor/command'
import { OperateMeta } from '~/editor/operate/meta'
import { Schema } from '~/editor/schema/schema'
import { Menu } from '~/global/menu'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = ({ name, id }) => {
  const selected = Schema.client.selectPageId === id
  const { classes, css } = useStyles({ selected })
  const isHover = useAutoSignal(false)
  const openMenu = () => {
    Menu.context = { id }
    Menu.menuOptions.dispatch([commands.pageGroup])
  }
  const selectPage = () => {
    OperateMeta.selectPage(id)
    Schema.commitHistory('选择页面 ' + id)
  }
  return (
    <Flex
      layout='h'
      justify='space-between'
      className={classes.PageItem}
      onHover={isHover.dispatch}
      onClick={selectPage}
      onContextMenu={openMenu}>
      <Flex layout='h' sidePadding={10} className={classes.name}>
        {name}
      </Flex>
      {selected && (
        <Icon
          size={18}
          fill={selected ? hslBlueColor(60) : ''}
          className={css({ marginRight: 10 })}>
          {Asset.editor.leftPanel.page.pageSelect}
        </Icon>
      )}
    </Flex>
  )
}

type IPageItemCompStyle = {
  selected: boolean
} /* & Required<Pick<IPageItemComp>> */ /* & Pick<IPageItemComp> */

const useStyles = makeStyles<IPageItemCompStyle>()((t, { selected }) => ({
  PageItem: {
    ...t.rect('100%', t.default$.normalHeight, 'no-radius', 'white'),
    cursor: 'pointer',
    flexShrink: 0,
    ...t.default$.hover.border,
    // ...(selected ? t.default$.select.background : t.default$.hover.background),
  },
  name: {
    fontSize: 12,
    //...(selected && t.default$.color.active),
  },
}))

PageItemComp.displayName = 'PageItemComp'
