import { FC, memo } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { OperateNode } from 'src/editor/operate/node'
import { OperateText } from 'src/editor/operate/text'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { AlignComp } from './align'
import { FillPropComp } from './fill'
import { EditorRightOperateGeo } from './geo'
import { ShadowComp } from './shadows'
import { StrokeComp } from './stroke'
import { TextComp } from './text'

export const OperatePanelComp: FC<{}> = memo(({}) => {
  useHookSignal(OperateNode.selectedNodes$)

  return (
    <G>
      <Scrollbars>
        <AlignComp />
        <EditorRightOperateGeo />
        <FillPropComp />
        <StrokeComp />
        <ShadowComp />
        {OperateText.textNodes.length > 0 && <TextComp />}
      </Scrollbars>
    </G>
  )
})
