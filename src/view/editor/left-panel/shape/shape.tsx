import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditorServices } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IShapeComp = {}

export const ShapeComp: FC<IShapeComp> = observer(({}) => {
  const { classes, cx } = useStyles({})
  const { schemaNodeService } = useEditorServices()
  return (
    <Flex layout='v' className={classes.Shape}>
      {Object.entries(schemaNodeService.nodeMap).map(([id, node]) => (
        <Flex
          key={id}
          layout='h'
          sidePadding={10}
          className={cx(
            classes.item,
            schemaNodeService.hoverId === id && classes.hovered,
            schemaNodeService.selectedIds.includes(id) && classes.selected
          )}
          onHover={(h) => schemaNodeService.hover(h ? id : '')}
          onMouseDown={() => schemaNodeService.select(id)}>
          {node.name}
        </Flex>
      ))}
    </Flex>
  )
})

type IShapeCompStyle = {} /* & Required<Pick<IShapeComp>> */ /* & Pick<IShapeComp> */

const useStyles = makeStyles<IShapeCompStyle>()((t) => ({
  Shape: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
    //borderBottom: '1px solid gray',
    overflowY: 'auto',
  },
  item: {
    ...t.rect('100%', 30, 'no-radius', 'white'),
    // borderBottom: '1px solid gray',
    fontSize: 12,
    ...t.default$.borderBottom,
  },
  hovered: {
    ...t.default$.hover.background,
  },
  selected: {
    ...t.default$.select.background,
  },
}))

ShapeComp.displayName = 'ShapeComp'
