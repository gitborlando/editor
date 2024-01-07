import { observer } from 'mobx-react'
import { FC } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeHeaderComp } from './header'
import { NodeListComp } from './list'

type INodeComp = {}

export const NodeComp: FC<INodeComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.Node}>
      <NodeHeaderComp />
      <NodeListComp />
    </Flex>
  )
})

type INodeCompStyle = {} /* & Required<Pick<INodeComp>> */ /* & Pick<INodeComp> */

const useStyles = makeStyles<INodeCompStyle>()((t) => ({
  Node: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
  },
}))

NodeComp.displayName = 'NodeComp'
