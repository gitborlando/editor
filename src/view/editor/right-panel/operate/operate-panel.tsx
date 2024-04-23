import { FC } from 'react'
import { OperateText } from '~/editor/operate/text'
import { StageSelect } from '~/editor/stage/interact/select'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { AlignComp } from './align/align'
import { FillPropComp } from './fill/fill-prop'
import { GeometryPropsComp } from './geometry/geometry-props'
import { PickerComp } from './picker/picker'
import { ShadowComp } from './shadow/shadows'
import { StrokeComp } from './stroke/stroke'
import { TextComp } from './text/text'

type IOperatePanelComp = {}

export const OperatePanelComp: FC<IOperatePanelComp> = ({}) => {
  const { classes } = useStyles({})
  useHookSignal(StageSelect.afterSelect, (_, f) => f(), { afterAll: true })
  const hasText = OperateText.textNodes.length > 0
  return (
    <Flex layout='v' className={classes.OperatePanel}>
      <AlignComp />
      <GeometryPropsComp />
      <FillPropComp />
      <StrokeComp />
      <ShadowComp />
      {hasText && <TextComp />}
      <PickerComp />
    </Flex>
  )
}

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
