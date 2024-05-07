import { FC, memo } from 'react'
import { OperateNode } from '~/editor/operate/node'
import { OperateText } from '~/editor/operate/text'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { AlignComp } from './align/align'
import { FillPropComp } from './fill/fill'
import { GeometryComp } from './geometry/geometry'
import { ShadowComp } from './shadow/shadows'
import { StrokeComp } from './stroke/stroke'
import { TextComp } from './text/text'

type IOperatePanelComp = {}

export const OperatePanelComp: FC<IOperatePanelComp> = memo(({}) => {
  const { classes } = useStyles({})
  useHookSignal(OperateNode.selectedNodes, { afterAll: true })

  return (
    <Flex layout='v' className={classes.OperatePanel}>
      <AlignComp />
      <GeometryComp />
      <FillPropComp />
      <StrokeComp />
      <ShadowComp />
      {OperateText.textNodes.length > 0 && <TextComp />}
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
