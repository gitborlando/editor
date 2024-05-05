import { Container, Graphics } from '@pixi/react'
import { FC, useRef } from 'react'
import { IFrame, INode } from '~/editor/schema/type'
import { PIXI } from '~/editor/stage/pixi'
import { useMemoSubComponent } from '~/shared/utils/normal'
import { useCollectRef, useDraw, useMemoChildren, useRenderChildren, useResetOBB } from '../hooks'

type IFrameComp = {
  frame: IFrame
}
type IFrameContentComp = {
  frame: IFrame
  children: INode[]
}

export const FrameComp: FC<IFrameComp> = ({ frame }) => {
  const children = useMemoChildren(frame)

  const FrameContentComp = useMemoSubComponent<IFrameContentComp>([], ({ frame, children }) => {
    const ref = useCollectRef<PIXI.Graphics>(frame)
    const maskRef = useRef<PIXI.Graphics>(null)
    const draw = useDraw(frame)
    useResetOBB(frame)
    return (
      <Container mask={maskRef.current}>
        <Graphics ref={ref} draw={draw} />
        <Graphics ref={maskRef} draw={draw} />
        {useRenderChildren(children)}
      </Container>
    )
  })

  return <FrameContentComp frame={frame} children={children} />
}

FrameComp.displayName = 'FrameComp'
