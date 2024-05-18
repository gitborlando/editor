import { FC, memo } from 'react'
import { OperateNode } from '~/editor/operate/node'
import { OperateText } from '~/editor/operate/text'
import { useHookSignal } from '~/shared/signal/signal-react'
import { Flex } from '~/view/ui-utility/widget/flex'
import { AlignComp } from './align'
import { FillPropComp } from './fill'
import { GeometryComp } from './geometry'
import { ShadowComp } from './shadows'
import { StrokeComp } from './stroke'
import { TextComp } from './text'

export const OperatePanelComp: FC<{}> = memo(({}) => {
  useHookSignal(OperateNode.selectedNodes, { afterAll: true })

  return (
    <Flex className='lay-v wh-100% of-y-auto d-scroll'>
      <AlignComp />
      <GeometryComp />
      <FillPropComp />
      <StrokeComp />
      <ShadowComp />
      {OperateText.textNodes.length > 0 && <TextComp />}
    </Flex>
  )
})
