import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { OperateNode } from 'src/editor/operate/node'
import { OperateText } from 'src/editor/operate/text'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { EditorRightOperateGeo } from 'src/view/editor/right-panel/operate/geo'
import { AlignComp } from './align'
import { FillPropComp } from './fill'
import { GeometryComp } from './geometry'
import { ShadowComp } from './shadows'
import { StrokeComp } from './stroke'
import { TextComp } from './text'

export const OperatePanelComp: FC<{}> = memo(({}) => {
  useHookSignal(OperateNode.selectedNodes$)

  return (
    <Flex layout='v' className='wh-100% of-y-auto d-scroll'>
      <AlignComp />
      <GeometryComp />
      <EditorRightOperateGeo />
      <FillPropComp />
      <StrokeComp />
      <ShadowComp />
      {OperateText.textNodes.length > 0 && <TextComp />}
    </Flex>
  )
})
