import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { FC, memo, useEffect } from 'react'
import { max } from '~/editor/math/base'
import { IFillColor, IText } from '~/editor/schema/type'
import { StageDraw } from '~/editor/stage/draw/draw'
import { PIXI } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'
import { getColorFromFill } from '~/shared/utils/color'
import { useCollectRef, useResetOBB } from '../hooks'

type ITextComp = {
  text: IText
}

export const TextComp: FC<ITextComp> = memo(({ text }) => {
  const ref = useCollectRef<PIXI.Text>(text)
  const resolution = max(StageViewport.zoom.value, 1)
  const style = new TextStyle({
    ...text.style,
    fill: getColorFromFill(text.fills[0] as IFillColor),
    wordWrapWidth: text.width,
    lineHeight: max(text.style.lineHeight, text.style.fontSize),
  })
  useResetOBB(text)
  useHookSignal(StageViewport.zoom)
  useEffect(() => void StageDraw.setGeometry(ref.current!, text), [text])

  return <Text ref={ref} text={text.content} style={style} resolution={resolution} />
})

TextComp.displayName = 'TextComp'
