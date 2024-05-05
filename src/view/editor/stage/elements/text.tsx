import { Text } from '@pixi/react'
import { TextStyle } from 'pixi.js'
import { FC, memo, useEffect } from 'react'
import { max } from '~/editor/math/base'
import { IText } from '~/editor/schema/type'
import { StageDraw2 } from '~/editor/stage/draw/draw'
import { PIXI } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useCollectRef, useResetOBB } from '../hooks'

type ITextComp = {
  text: IText
}

export const TextComp: FC<ITextComp> = memo(({ text }) => {
  const ref = useCollectRef<PIXI.Text>(text)
  const zoom = StageViewport.zoom.value
  useResetOBB(text)
  useHookSignal(StageViewport.zoom)
  useEffect(() => void StageDraw2.setGeometry(ref.current!, text), [text])

  return (
    <Text
      ref={ref}
      resolution={max(zoom, 1)}
      text={text.content}
      style={new TextStyle(text.style)}
    />
  )
})

TextComp.displayName = 'TextComp'
