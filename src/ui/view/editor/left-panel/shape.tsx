import { observer } from 'mobx-react'
import { FC } from 'react'
import { useService } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IShapeComp = {}

export const ShapeComp: FC<IShapeComp> = observer(({}) => {
  const { classes, cx } = useStyles({})
  const { schemaNodeService, selectService } = useService()

  return (
    <Flex layout='v' className={classes.Shape}>
      {Object.keys(schemaNodeService.nodeMap).map((id) => (
        <Flex
          key={id}
          layout='h'
          className={cx(classes.item, selectService.hoverId === id && classes.hovered)}>
          {id}
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
  },
  hovered: {
    color: 'blue',
  },
}))

ShapeComp.displayName = 'ShapeComp'
