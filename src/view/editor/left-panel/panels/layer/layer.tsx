import { FC, memo } from 'react'
import { useSchema } from '~/view/editor/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeComp } from './node/node'
import { PageComp } from './page/page'

type ILayerComp = {}

export const LayerComp: FC<ILayerComp> = memo(({}) => {
  const { classes } = useStyles({})
  useSchema()
  return (
    <Flex layout='v' className={classes.Layer}>
      <PageComp />
      <NodeComp />
    </Flex>
  )
})

type ILayerCompStyle = {} /* & Required<Pick<ILayerComp>> */ /* & Pick<ILayerComp> */

const useStyles = makeStyles<ILayerCompStyle>()((t) => ({
  Layer: {
    ...t.rect('100%', '100%', 'no-radius', 'white'),
  },
}))

LayerComp.displayName = 'LayerComp'
