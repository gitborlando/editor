import { observer, useLocalObservable } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/editor/ioc'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IShapeItemComp = {}

export const ShapeItemComp: FC<IShapeItemComp> = observer(({}) => {
  const { classes } = useStyles({})
  const {} = useServices()
  const state = useLocalObservable(() => ({}))
  return <Flex className={classes.ShapeItem}></Flex>
})

type IShapeItemCompStyle = {} /* & Required<Pick<IShapeItemComp>> */ /* & Pick<IShapeItemComp> */

const useStyles = makeStyles<IShapeItemCompStyle>()((t) => ({
  ShapeItem: {
    ...t.rect('100%', 30, 'no-radius', 'white'),
    borderBottom: '1px solid gray',
  },
}))

ShapeItemComp.displayName = 'ShapeItemComp'
