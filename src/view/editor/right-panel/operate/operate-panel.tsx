import { observer } from 'mobx-react'
import { FC } from 'react'
import { When } from 'react-if'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryPropsComp } from './geometry/geometry-props'
import { PickerComp } from './picker/picker'

type IOperatePanelComp = {}

export const OperatePanelComp: FC<IOperatePanelComp> = observer(({}) => {
  const { SchemaNode } = useEditor()
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.OperatePanel}>
      <When condition={SchemaNode.selectIds.size}>
        <GeometryPropsComp />
      </When>
      <PickerComp />
    </Flex>
  )
})

type IOperatePanelCompStyle =
  {} /* & Required<Pick<IOperatePanelComp>> */ /* & Pick<IOperatePanelComp> */

const useStyles = makeStyles<IOperatePanelCompStyle>()((t) => ({
  OperatePanel: {
    ...t.rect('100%', '100%'),
  },
}))

OperatePanelComp.displayName = 'OperatePanelComp'
