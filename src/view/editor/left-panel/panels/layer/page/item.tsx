import { FC } from 'react'
import { SchemaPage } from '~/editor/schema/page'
import { useAutoSignal, useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = ({ name, id }) => {
  useHookSignal(SchemaPage.currentId)
  const { classes } = useStyles({ selected: SchemaPage.currentId.value === id })
  const isHover = useAutoSignal(false)
  return (
    <Flex
      layout='h'
      justify='space-between'
      className={classes.PageItem}
      onHover={isHover.dispatch}
      onClick={() => SchemaPage.select(id)}>
      <Flex layout='h' sidePadding={10} className={classes.name}>
        {name}
      </Flex>
      {/* {isHover.value && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            SchemaPage.delete(id)
          }}>
          <Icon>{Asset.editor.shared.delete}</Icon>
        </Button>
      )} */}
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
    ...(selected ? t.default$.select.background : t.default$.hover.background),
  },
  name: {
    fontSize: 12,
    //...(selected && t.default$.color.active),
  },
}))

PageItemComp.displayName = 'PageItemComp'
