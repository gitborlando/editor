import { FC } from 'react'
import { SchemaNode } from '~/editor/schema/node'
import { StageSelect } from '~/editor/stage/interact/select'
import { useHookSignal } from '~/shared/signal-react'
import { lastOne } from '~/shared/utils/array'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryPropsComp } from './geometry/geometry-props'

type IOperatePanelComp = {}

export const OperatePanelComp: FC<IOperatePanelComp> = ({}) => {
  const { afterSelect } = StageSelect
  const { classes } = useStyles({})
  useHookSignal(afterSelect)
  useHookSignal(SchemaNode.hoverIds)
  return (
    <Flex layout='v' className={classes.OperatePanel}>
      {SchemaNode.selectIds.value.size !== 0 && <GeometryPropsComp />}
      {/* <PickerComp /> */}
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
