import { FC, memo, useEffect, useState, useTransition } from 'react'
import { EditorCursor } from '~/editor/editor/cursor'
import { xy_client } from '~/editor/math/xy'
import { Pixi } from '~/editor/stage/pixi'
import { StageViewport } from '~/editor/stage/viewport'
import { hslBlueColor } from '~/shared/utils/color'
import { addListener } from '~/shared/utils/event'
import { iife } from '~/shared/utils/normal'
import Asset from '../ui-utility/assets'
import { Icon } from '../ui-utility/widget/icon'

export const CursorComp: FC<{}> = memo(({}) => {
  const [_, transition] = useTransition()
  const getState = () => ({
    show: EditorCursor.show || EditorCursor.inViewport,
    type: EditorCursor.type,
    xy: EditorCursor.xy,
    rotation: EditorCursor.rotation,
  })
  const [state, setState] = useState(getState())
  const { show, type, xy, rotation } = state

  useEffect(() => {
    return addListener('mousemove', (e) => {
      EditorCursor.setCursor({ xy: xy_client(e) })
      EditorCursor.inViewport = StageViewport.inViewport(EditorCursor.xy)
      setState(getState())
    })
  }, [])

  useEffect(() => {
    Pixi.htmlContainer.style.cursor = show ? 'none' : 'auto'
  }, [show])

  return (
    show && (
      <Icon
        style={{ left: xy.x, top: xy.y }}
        rotate={rotation}
        size={20}
        fill={hslBlueColor(60)}
        className='fixed left-0 top-0 pointer-events-none'>
        {iife(() => {
          if (type === 'select') return Asset.editor.cursor.select
          if (type === 'resize') return Asset.editor.cursor.resize
        })}
      </Icon>
    )
  )
})
