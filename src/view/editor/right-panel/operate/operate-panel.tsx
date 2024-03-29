import { FC } from 'react'
import { SchemaNode } from '~/editor/schema/node'
import { useHookSignal } from '~/shared/signal-react'
import { lastOne } from '~/shared/utils/array'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { AlignComp } from './align/align'
import { FillPropComp } from './fill/fill-prop'
import { GeometryPropsComp } from './geometry/geometry-props'
import { PickerComp } from './picker/picker'
import { StrokeComp } from './stroke/stroke'

type IOperatePanelComp = {}

export const OperatePanelComp: FC<IOperatePanelComp> = ({}) => {
  const { classes } = useStyles({})
  useHookSignal(SchemaNode.hoverIds)
  return (
    <Flex layout='v' className={classes.OperatePanel}>
      <AlignComp />
      <GeometryPropsComp />
      <FillPropComp />
      <StrokeComp />
      <PickerComp />
      <Flex style={{ marginTop: 'auto' }}>{lastOne(SchemaNode.hoverIds.value)}</Flex>
    </Flex>
  )
}

type IOperatePanelCompStyle =
  {} /* & Required<Pick<IOperatePanelComp>> */ /* & Pick<IOperatePanelComp> */

const useStyles = makeStyles<IOperatePanelCompStyle>()((t) => ({
  OperatePanel: {
    ...t.rect('100%', '100%'),
  },
}))

OperatePanelComp.displayName = 'OperatePanelComp'
