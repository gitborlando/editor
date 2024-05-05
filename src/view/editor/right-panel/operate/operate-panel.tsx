import { FC, memo } from 'react'
import { OperateText } from '~/editor/operate/text'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { useSelectedNodes } from '../../context'
import { AlignComp } from './align/align'
import { FillPropComp } from './fill copy/fill'
import { GeometryComp } from './geometry/geometry'
import { PickerComp } from './picker/picker'
import { ShadowComp } from './shadow/shadows'
import { StrokeComp } from './stroke/stroke'
import { TextComp } from './text/text'

type IOperatePanelComp = {}

export const OperatePanelComp: FC<IOperatePanelComp> = memo(({}) => {
  const { classes } = useStyles({})
  // useHookSignal(StageSelect.afterSelect, { afterAll: true })
  useSelectedNodes()
  // useHookSignal(OperateNode.selectedNodes, { afterAll: true })

  return (
    <Flex layout='v' className={classes.OperatePanel}>
      <AlignComp />
      <GeometryComp />
      <FillPropComp />
      <StrokeComp />
      <ShadowComp />
      {OperateText.textNodes.length > 0 && <TextComp />}
      <PickerComp />
    </Flex>
  )
})

type IOperatePanelCompStyle =
  {} /* & Required<Pick<IOperatePanelComp>> */ /* & Pick<IOperatePanelComp> */

const useStyles = makeStyles<IOperatePanelCompStyle>()((t) => ({
  OperatePanel: {
    ...t.rect('100%', '100%'),
    overflowY: 'auto',
    ...t.default$.scrollBar,
  },
}))

OperatePanelComp.displayName = 'OperatePanelComp'
